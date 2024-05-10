const vscode = require('vscode');

function activate(context) {
  let disposable = vscode.commands.registerCommand('commilitiaFonts.activate', () => {
    const applyCss = `const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdn.jsdelivr.net/gh/Commilitia/Resources@master/fonts/commilitiaFonts.css';
    document.head.appendChild(link);`;
    vscode.workspace.openTextDocument({
      content: applyCss,
      language: 'javascript'
    }).then(doc => vscode.window.showTextDocument(doc));

    context.subscriptions.push(disposable);
  });
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;