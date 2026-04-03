# 🃏 UNO Vision (Uno Gesture)

UNO Vision 是一个完全**基于手势控制**的 UNO 卡牌游戏，利用计算机视觉技术让你只需隔空挥动手势，即可与 AI 对手展开刺激的卡牌对战。

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-00B2FF?style=for-the-badge)

## ✨ 核心特性

- 🖐️ **手势操控**：集成 Google MediaPipe 视觉模型，使用摄像头实时捕捉手部节点，支持隔空捏合抓取卡牌、拖拽出牌。
- 🤖 **AI 智能对手**：内置 3 个 AI 对手，自动判断场上局势、出牌及摸牌，体验真实的 UNO 对战节奏。
- 🎨 **精美现代 UI**：采用 Retro-Futurism（复古科幻）美学设计风格，包括动态卡牌悬浮、发光手势光标和全局径向渐变背景。
- 📜 **完整 UNO 规则**：支持包括数字牌、Skip (跳过)、Reverse (反转)、Draw Two (+2)、Wild (变色牌) 以及 Wild Draw Four (+4) 等完整功能。

## 🎮 怎么玩？

无需鼠标和键盘，你只需要：
1. **允许摄像头权限**：首次加载时，浏览器会请求使用你的摄像头，并在左侧加载视觉识别模型。
2. **移动光标**：对准摄像头展示手掌，屏幕上会出现一个光标并跟随你的手移动。
3. **抓取卡牌**：将光标移动到你手牌中**合法可出**的卡片上，**食指与拇指捏合**即可抓取。
4. **出牌**：保持捏合状态，将卡牌拖拽至画面中央的“弃牌堆”上方，然后**松开双指**完成出牌！
5. 如果你没有合适的牌出，可以点击/悬停到牌堆上摸牌。

## 🚀 本地运行与部署

**前置要求:** Node.js (推荐 v18+)

1. 克隆项目到本地：
   ```bash
   git clone https://github.com/ashreo/Uno-Gesture.git
   cd Uno-Gesture
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中访问 `http://localhost:3000` 体验游戏！

### 🌐 部署到 GitHub Pages

本项目已配置了自动部署到 GitHub Pages 的 GitHub Actions 工作流。只需执行以下步骤即可部署：

1. 确保项目的 `next.config.ts` 中设置了正确的 `basePath` 和 `assetPrefix` (已配置为 `/Uno-Gesture`)，并将 `output` 设置为 `'export'`。
2. 将代码推送到 GitHub 的 `main` 分支，GitHub Actions 将会自动触发构建和部署流程。
3. 在你的 GitHub 仓库的 **Settings > Pages** 中，确保 "Build and deployment" 的 "Source" 设置为 **GitHub Actions**。
4. 等待 Action 运行完毕后，访问 `https://<你的用户名>.github.io/Uno-Gesture` 即可体验。

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/) / React
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **机器视觉**: [@mediapipe/tasks-vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- **设计辅助**: Trae `ui-ux-pro-max` 技能

## 📄 许可证

本项目基于 MIT License 许可 - 详情请参阅仓库文件。
