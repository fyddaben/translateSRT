# translateSRT
## 说明
  - 这个项目需要 Claude API KEY
  - 这个项目是由于各个平台的翻译总是各种问题
    - 一次对话翻译，最多只有50个句子就停了，我的翻译文件有1000多个句子
    - 翻译水平参差不齐，使用了kimi，豆包，chatgpt,claude 等等，只有 豆包和claude 比较满意，对于专业术语翻译的还可以
  - 如果是小白使用，推荐 [沉浸式翻译](https://immersivetranslate.com/)，支持srt文件上传，直接翻译，但是需要花钱
  - 我平时工作，有充值cluade，所以就写个脚本，用claude 进行逐条翻译
## 使用流程
- 新建 .env 文件
  - 声明 `ANTHROPIC_API_KEY=xxx
  BASE_URL=https://api.anthropic.com
  `
- npm i 安装依赖
- 把srt文件拖到项目根目录,执行命令，例如 `node index test.srt`


## Description
  - This project needs ANTHROPIC_API_KEY
  - This project is initiated due to various issues encountered with different translation platforms:
    - Some platforms limit translation to only 50 sentences per conversation, whereas my translation files contain over 1000 sentences.
    - The quality of translations varies widely. I have used Kimi, Doubao, ChatGPT, Claude, and others, with only Doubao and Claude providing satisfactory results, especially for professional terminology.
    - For beginners, I recommend [沉浸式翻译](https://immersivetranslate.com/), which supports uploading SRT files for direct translation, though it requires payment.
    - Since I regularly use Claude and have a subscription, I decided to write a script to translate using Claude line by line.
## Usage
  - Create a new .env file
    - Declare `ANTHROPIC_API_KEY=xxx
  BASE_URL=https://api.anthropic.com
  `
  - Run npm i to install dependencies
  - Drag the SRT file to the project root directory and execute the command, for example, node index test.srt