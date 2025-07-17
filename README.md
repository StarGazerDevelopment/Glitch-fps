# GLITCH - First Person Shooter Game

A high-quality 3D FPS game built with HTML5, CSS3, and JavaScript using Three.js for stunning graphics and immersive gameplay.

![GLITCH Game](https://img.shields.io/badge/GLITCH-FPS%20Game-00ff00?style=for-the-badge&logo=javascript&logoColor=white)

## 🎮 Features

### High-Quality Graphics
- **Real-time 3D rendering** with Three.js
- **Dynamic lighting** with shadows and ambient effects
- **Particle systems** for atmospheric effects
- **Post-processing effects** including tone mapping
- **Responsive design** that adapts to any screen size

### Immersive Gameplay
- **First-person controls** with mouse look and WASD movement
- **Enemy AI** that actively hunts the player
- **Weapon system** with ammo management and recoil
- **Health system** with visual feedback
- **Score tracking** and persistent statistics

### Modern UI/UX
- **Cyberpunk aesthetic** with glitch effects and neon colors
- **Animated home screen** with particle effects and grid animations
- **Smooth transitions** between game states
- **Responsive HUD** with health, ammo, and score display
- **Settings menu** with customizable options

### Audio System
- **3D spatial audio** using Web Audio API
- **Dynamic sound effects** for shooting and impacts
- **Ambient background audio** for atmosphere
- **Volume controls** and audio settings

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Click "START GAME" to begin playing

### Running Locally
```bash
# If you have Python installed
python -m http.server 8000

# If you have Node.js installed
npx http-server

# Then open http://localhost:8000 in your browser
```

## 🎯 How to Play

### Controls
- **WASD** or **Arrow Keys**: Move
- **Mouse**: Look around
- **Left Click**: Shoot
- **Space**: Jump
- **Escape**: Pause/Menu

### Objective
- Eliminate enemy targets to score points
- Survive as long as possible
- Each enemy killed gives you 100 points
- Enemies respawn after being eliminated

### Gameplay Tips
- Keep moving to avoid enemy attacks
- Use cover provided by the maze-like environment
- Monitor your ammo and health
- Enemies will actively pursue you

## 🎨 Graphics Quality Settings

The game includes multiple graphics quality options:

- **Low**: Basic lighting, reduced shadows
- **Medium**: Balanced performance and visuals (default)
- **High**: Enhanced lighting and effects
- **Ultra**: Maximum visual fidelity

## ⚙️ Settings

### Graphics Quality
Adjust the visual fidelity to match your system's capabilities.

### Mouse Sensitivity
Customize mouse look sensitivity from 0.1 to 2.0.

### Sound Volume
Control audio levels from 0% to 100%.

## 🛠️ Technical Details

### Built With
- **HTML5**: Game structure and UI
- **CSS3**: Styling and animations
- **JavaScript (ES6+)**: Game logic and mechanics
- **Three.js**: 3D graphics engine
- **Web Audio API**: Sound system

### Performance Features
- **Optimized rendering** with efficient 3D models
- **Level of detail** system for distant objects
- **Frustum culling** to render only visible objects
- **Efficient particle systems** with GPU acceleration

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎵 Audio Credits

The game uses procedural audio generation for:
- Weapon firing sounds
- Impact effects
- Ambient background audio
- 3D spatial positioning

## 🔧 Development

### Project Structure
```
fps-game/
├── index.html          # Main game file
├── styles.css          # Game styling and animations
├── game.js            # Game logic and 3D engine
└── README.md          # This file
```

### Key Components
- **GameState**: Manages game state and settings
- **GlitchGame**: Main game engine class
- **Three.js Scene**: 3D world and rendering
- **Audio System**: Sound effects and music
- **UI Manager**: Menu and HUD systems

## 🎮 Game Features

### Visual Effects
- **Glitch animations** on the title screen
- **Particle systems** for atmospheric effects
- **Dynamic lighting** with real-time shadows
- **Post-processing** with tone mapping
- **Smooth animations** and transitions

### Game Mechanics
- **FPS controls** with mouse look
- **Physics-based movement** with jumping
- **Enemy AI** with pathfinding
- **Weapon system** with recoil and ammo
- **Health and damage** system
- **Score tracking** and persistence

### User Interface
- **Modern cyberpunk design**
- **Responsive layout** for all screen sizes
- **Animated menus** with hover effects
- **Real-time HUD** with health and ammo
- **Settings panel** with customization options

## 🚀 Future Enhancements

Potential features for future versions:
- Multiple weapon types
- Power-ups and collectibles
- Different enemy types
- Level progression system
- Multiplayer support
- VR compatibility
- More detailed environments
- Advanced AI behaviors

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure your browser supports WebGL
3. Try updating to the latest browser version
4. Disable browser extensions that might interfere

---

**Enjoy playing GLITCH!** 🎮

*Built with passion for high-quality web gaming experiences.* 