const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const {transformFromAst} = require('babel-core');
const config = require('../config');
const glob = require('glob');

let ID = 0;

class Bundler {
  createAsset(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    const ast = babylon.parse(content, {
      sourceType: 'module',
    });

    const dependencies = [];

    traverse(ast, {
      ImportDeclaration: ({node}) => {
        dependencies.push(node.source.value);
      },
    });

    const id = ID++;

    const {code} = transformFromAst(ast, null, {
      presets: ['env'],
    });

    return {
      id,
      filename,
      dependencies,
      code,
    };
  }

  createGraph(entry) {
    const mainAsset = this.createAsset(entry);

    const queue = [mainAsset];

    for (const asset of queue) {
      asset.mapping = {};

      const dirname = path.dirname(asset.filename);

      asset.dependencies.forEach(relativePath => {
        const absolutePath = path.join(dirname, relativePath);

        const child = this.createAsset(absolutePath);

        asset.mapping[relativePath] = child.id;

        queue.push(child);
      });
    }
    return queue;
  }

  bundle(graph) {
    let modules = '';

    graph.forEach(mod => {
      modules += `${mod.id}: [
            function (require, module, exports) {
              ${mod.code}
            },
            ${JSON.stringify(mod.mapping)},
          ],`;
    });

    const result = `
          (function(modules) {
            function require(id) {
              const [fn, mapping] = modules[id];
              function localRequire(name) {
                return require(mapping[name]);
              }
              const module = { exports : {} };
              fn(localRequire, module, module.exports);
              return module.exports;
            }
            require(0);
          })({${modules}})
        `;

    return result;
  }

  writeJsBundle() {
    const graph = this.createGraph(`${config.sourceDirectory}/${config.entry}`);
    const result = this.bundle(graph);
    ID = 0;
    fs.writeFileSync(`${config.out}/index.js`, result);
  }

  bundleCss(html) {
    let cssContent = '';
    glob.sync(`${config.sourceDirectory}/**/*.css`).forEach(el => {
      const styles = fs.readFileSync(el, 'utf-8');
      cssContent += styles;
    });
    const styles = `<style>${cssContent}</style>`;
    return html.replace(new RegExp('</head>', 'i'), `${styles}</head>`);
  }

  inject(html) {
    let match;
    let injectTag;
    const injectCandidates = [
      new RegExp('</body>', 'i'),
      new RegExp('</svg>'),
      new RegExp('</head>', 'i'),
    ];
    const INJECTED_CODE = fs.readFileSync(
      `${__dirname}/injected.html`,
      'utf-8',
    );

    for (let i = 0; i < injectCandidates.length; ++i) {
      match = injectCandidates[i].exec(html);
      if (match) {
        injectTag = match[0];
        break;
      }
    }
    if (injectTag) {
      return html.replace(
        new RegExp(injectTag, 'i'),
        INJECTED_CODE + injectTag,
      );
    }
  }

  writeHtml() {
    const html = fs.readFileSync(
      `${config.sourceDirectory}/${config.html}`,
      'utf-8',
    );
    const injectedHtml = this.inject(html);
    const styledHtml = this.bundleCss(injectedHtml);
    fs.writeFileSync(`${config.out}/${config.html}`, styledHtml);
  }
}

module.exports = Bundler;
