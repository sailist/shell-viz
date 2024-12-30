const Parser = require('tree-sitter');
const Bash = require('tree-sitter-bash');

const parser = new Parser();
parser.setLanguage(Bash);
const fs = require('fs');

// 读取本地脚本文件
const scriptPath = process.argv[2];
const script = fs.readFileSync(scriptPath, 'utf8');

// 解析脚本内容
let tree;
try {
  tree = parser.parse(script);
} catch (e) {
  // console.error(script)
  // console.error(scriptPath);
  // console.error(e);
  process.exit(1);
}

const edges = [];

function traverseNode(node, functionContext = '') {
  // 如果是函数定义节点，记录当前函数名
  if (node.type === 'function_definition') {
    const nameNode = node.childForFieldName('name');
    functionContext = nameNode ? nameNode.text : 'anonymous';
    // console.log(`\n函数定义: ${functionContext}`);
  }

  // 如果是命令节点且在函数上下文中，打印命令
  if (node.type === 'command' && functionContext) {
    const cmdName = node.firstNamedChild?.text;
    if (cmdName) {
      // edges.push(`${functionContext} -> ${cmdName}`);
      console.log(`${functionContext} -> ${cmdName}`);
    }
  }

  // 递归遍历所有子节点
  for (const child of node.children || []) {
    traverseNode(child, functionContext);
  }
}

// 从根节点开始遍历
traverseNode(tree.rootNode);

fs.writeFileSync('edges.txt', edges.join('\n'));

// type == 'command'
// type == 'function_definition'