# SquadGraph: World Cup 2026 Player Network Explorer

An interactive visualization tool that maps the club connections between players in the 2026 FIFA World Cup. Discover how players from different national teams are linked through shared club history.

![SquadGraph Screenshot](https://squad-graph.vercel.app/screenshot.png)

## 🌟 Features

- **Interactive Network Visualization**: Explore a force-directed graph of 1,248 players and 11,035 club connections
- **Powerful Search**: Find any player instantly and see their network connections
- **Country Filtering**: Focus on specific national teams and their player networks
- **Season Filtering**: Analyze connections from specific seasons (2010-2024)
- **Player Details**: View comprehensive player information including position, nationality, and all club connections
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Fast Performance**: Optimized data structure for smooth interactions

## 🚀 Live Demo

Visit the live application: **[https://squad-graph.vercel.app](https://squad-graph.vercel.app)**

## 📊 Data Sources

This project uses data from the official [WC2026 Squad Graph Dataset](https://github.com/layerx-labs/wc2026-squad-graph-dataset):

- **Players**: 1,248 players from 48 national teams
- **Clubs**: 1,578 unique clubs worldwide
- **Connections**: 11,035 player pairs who have played for the same club
- **Time Range**: 2010-2024 seasons

The dataset is sourced from Wikidata and includes comprehensive club history for each player.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Visualization**: react-force-graph-2d (D3.js force simulation)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Data Processing**: Custom TypeScript scripts

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/layerx-labs/arena-the-squad-graph-qwen.git
cd arena-the-squad-graph-qwen
```

2. Install dependencies:
```bash
npm install
```

3. Generate the graph data:
```bash
npm run build:graph
```

This script:
- Downloads the latest dataset from the official source
- Processes player and club data
- Builds the network graph structure
- Generates optimized JSON files in `public/data/`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Build for Production

```bash
npm run build
```

This will:
1. Generate the graph data
2. Build the Next.js application
3. Create optimized static files in `.next/`

To preview the production build:
```bash
npm start
```

## 📁 Project Structure

```
squad-graph/
├── public/
│   └── data/
│       ├── graph-data.json      # Main graph data (generated)
│       ├── players.json         # Player dataset
│       ├── clubs.json           # Club dataset
│       └── gaps.json            # Data gaps information
├── scripts/
│   └── build-graph.ts           # Data processing script
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with navigation
│   │   ├── page.tsx             # Main graph visualization
│   │   ├── about/
│   │   │   └── page.tsx         # About page
│   │   ├── query/
│   │   │   └── page.tsx         # Query interface
│   │   ├── stats/
│   │   │   └── page.tsx         # Statistics page
│   │   └── globals.css          # Global styles
│   └── lib/
│       ├── graph.ts             # Graph utilities and algorithms
│       └── types.ts             # TypeScript type definitions
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── vercel.json
```

## 🎮 Usage

### Exploring the Graph

- **Zoom**: Use mouse wheel or pinch gesture
- **Pan**: Click and drag on empty space
- **Select Player**: Click on a node to see their connections
- **Search**: Use the search bar to find specific players
- **Filter by Country**: Select a country from the dropdown
- **Filter by Season**: Choose a specific season to see connections from that period

### Understanding Connections

Each edge (line) between two players represents a shared club experience:
- Players are connected if they played for the same club during overlapping time periods
- The graph shows both current and historical connections
- Hover over edges to see which club connected the players

## 🔍 Key Insights

The visualization reveals fascinating patterns:

- **European Club Hubs**: Major European clubs like Barcelona, Real Madrid, and Manchester City serve as central hubs connecting players from multiple national teams
- **Cross-National Connections**: Players from rival national teams often share club history
- **Youth Academy Networks**: Some players are connected through youth academies before moving to different clubs
- **Transfer Patterns**: The graph shows how player transfers create networks across different leagues and countries

## 🚢 Deployment

The application is automatically deployed to Vercel:

- **Production**: [https://squad-graph.vercel.app](https://squad-graph.vercel.app)
- **Repository**: [https://github.com/layerx-labs/arena-the-squad-graph-qwen](https://github.com/layerx-labs/arena-the-squad-graph-qwen)

### Deploy Your Own

1. Fork this repository
2. Connect to Vercel
3. Vercel will automatically detect Next.js and deploy

Or deploy manually:
```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

1. **Report Bugs**: Open an issue if you find any bugs
2. **Suggest Features**: Share your ideas for new features
3. **Improve Documentation**: Help make the docs better
4. **Submit PRs**: Fix bugs or add new features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Data Source**: [WC2026 Squad Graph Dataset](https://github.com/layerx-labs/wc2026-squad-graph-dataset) by LayerX Labs
- **Visualization Library**: [react-force-graph](https://github.com/vasturiano/react-force-graph) by Vasco Asturiano
- **Framework**: [Next.js](https://nextjs.org/) by Vercel
- **Hackathon**: [TAIKAI AI Agent Hackathon](https://taikai.network/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ for the TAIKAI AI Agent Hackathon
