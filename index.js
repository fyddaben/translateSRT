require('dotenv').config(); // 加载 .env 文件
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const baseUrl = process.env.BASE_URL 
/**
 * 解析 SRT 文件为 JSON 对象数组
 * 格式示例: [{index: 1, time:'00:00:00,000 --> 00:00:00,000', content: 'xxx'}]
 *
 * @param {string} filePath - SRT 文件路径
 * @returns {Array} 解析后的字幕数组
 */
function parseSrtFile(filePath) {
  // 读取文件内容（使用 utf8 编码）
  const srtContent = fs.readFileSync(filePath, 'utf8');
  
  // 按空行拆分为若干块，每块代表一个字幕
  const blocks = srtContent.split(/\r?\n\r?\n/).filter(block => block.trim() !== '');
  
  const entries = blocks.map(block => {
    // 按行分割，并移除每行的空白字符
    const lines = block.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      // 如果数据格式不正确则跳过
      return null;
    }
    // 第一行为字幕编号
    const index = parseInt(lines[0], 10);
    // 第二行为时间码
    const time = lines[1];
    // 剩下的所有行合并为字幕内容（多个内容行以空格拼接，也可以使用换行符）
    const content = lines.slice(2).join(' ');
    return { index, time, content };
  }).filter(item => item !== null);

  return entries;
}

/**
 * 使用 axios 请求 Claude API 翻译字幕内容
 *
 * @param {string} text - 需要翻译的文本
 * @returns {string} 翻译后的文本
 */
async function translateText(text) {
  const endpoint = baseUrl + "/v1/messages";
  
  // 构造 Claude API 的 prompt，注意通常需要包含 Human 与 Assistant 的交互格式
  const requestBody = {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": `
        This sentence is from a BJJ instructional video,
        Translate the following sentence into Chinese,
        No other redundant information.
        '${text}'
        `}
    ]
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });
    // 假设 Claude API 返回的翻译结果在 response.data.content 字段中
    const content = response.data.content;
    let msg = '';
    if (content && content.length > 0) {
      msg = content[0].text;
      // 去除翻译结果中的所有双引号
      msg = msg.replace(/"/g, '');
    }
    return msg;
  } catch (error) {
    console.error("翻译错误:", error.message);
    return "";
  }
}

/**
 * 根据包含翻译结果的字幕数组生成 SRT 文件
 *
 * @param {Array} entries - 包含字幕数据和翻译结果的数组
 * @param {string} inputFilePath - 原始 SRT 文件路径, 用于构造输出文件名
 */
function generateTranslatedSrt(entries, inputFilePath) {
  const parsedPath = path.parse(inputFilePath);
  const outputFilePath = path.join(parsedPath.dir, `${parsedPath.name}_translate.srt`);

  let srtContent = '';
  for (const entry of entries) {
    // 如果存在翻译结果，使用翻译后的文本，否则使用原始内容
    //const text = entry.translated ? entry.translated : entry.content;
    srtContent += `${entry.index}\n${entry.time}\n${entry.content}\n${entry.translated}\n\n`;
  }

  fs.writeFileSync(outputFilePath, srtContent, 'utf8');
  console.log(`已生成翻译后的 SRT 文件: ${outputFilePath}`);
}

/**
 * 主函数：解析 SRT 文件并翻译每条字幕内容，再生成一个新的 SRT 文件
 */
async function main() {
  if (process.argv.length < 3) {
    console.error("用法: node translateSrt.js <path_to_srt_file>");
    process.exit(1);
  }

  const filePath = process.argv[2];
  const entries = parseSrtFile(filePath);

  // 遍历每个字幕条目，并翻译 content 字段
  for (const entry of entries) {
    console.log(`正在翻译 第${entry.index}条字幕...`);
    const translated = await translateText(entry.content);
    entry.translated = translated;
  }

  // 输出包含翻译结果的 JSON
  console.log(JSON.stringify(entries, null, 2));

  // 根据翻译结果生成新的 SRT 文件
  generateTranslatedSrt(entries, filePath);
}

main();


