'use client';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About SquadGraph</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📖 What is SquadGraph?</h2>
          <p className="text-gray-700 mb-4">
            SquadGraph is an interactive visualization and query tool for exploring the hidden connections
            between players at the 2026 FIFA World Cup. It reveals how players from different national teams
            are linked through shared club history — teammates who once played together at the same club
            in the same season, but now represent rival nations on the world stage.
          </p>
          <p className="text-gray-700">
            For example: Player A (Brazil) and Player B (France) both played for Paris Saint-Germain
            in the 2021/22 season. This tool lets you discover and explore all such connections across
            the entire tournament.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Interactive Graph Explorer:</strong> Force-directed visualization of the player network
              with filtering by country, position, and season
            </li>
            <li>
              <strong>Query Interface:</strong> Three query modes — by club & season, by player, and by country pairs
            </li>
            <li>
              <strong>Path Finder:</strong> Find the shortest path between any two players through shared club connections
            </li>
            <li>
              <strong>Statistics Dashboard:</strong> Insights into the most connected players, clubs, and national teams
            </li>
            <li>
              <strong>Responsive Design:</strong> Works on desktop and mobile devices
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Data Source</h2>
          <p className="text-gray-700 mb-4">
            This project uses the official World Cup 2026 Squad Graph Dataset (v1.0) provided by the
            hackathon organizers. The dataset includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>1,248 players from all participating nations</li>
            <li>1,578 clubs worldwide</li>
            <li>Complete squad lists for each national team</li>
            <li>Per-player, per-season club career histories</li>
          </ul>
          <p className="text-gray-700">
            The dataset is sourced from{' '}
            <a
              href="https://github.com/layerx-labs/wc2026-squad-graph-dataset"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              layerx-labs/wc2026-squad-graph-dataset
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 How It Works</h2>
          <p className="text-gray-700 mb-4">
            The graph is built using a simple but powerful algorithm:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>
              <strong>Group players by club and season:</strong> For each (club_id, season) pair, we collect
              all players who played for that club during that season
            </li>
            <li>
              <strong>Create edges:</strong> Every pair of players in the same group is connected by an edge,
              representing their shared club experience
            </li>
            <li>
              <strong>Build the graph:</strong> Players are nodes, edges represent connections, and we compute
              statistics like degree centrality and clustering
            </li>
          </ol>
          <p className="text-gray-700">
            The edge rule is simple: two players share an edge if and only if they have a stint with the
            same club_id AND the same season. This ensures accuracy and avoids false connections.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🛠️ Technology Stack</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Next.js 14:</strong> React framework with App Router for modern web development</li>
            <li><strong>TypeScript:</strong> Type-safe development for better code quality</li>
            <li><strong>Tailwind CSS:</strong> Utility-first CSS framework for rapid UI development</li>
            <li><strong>react-force-graph-2d:</strong> Force-directed graph visualization library</li>
            <li><strong>Fuse.js:</strong> Lightweight fuzzy-search library for player and club search</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Getting Started</h2>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm text-gray-800">
            <p className="mb-2"># Clone the repository</p>
            <p className="mb-4">git clone https://github.com/layerx-labs/arena-the-squad-graph-qwen.git</p>
            
            <p className="mb-2"># Install dependencies</p>
            <p className="mb-4">cd arena-the-squad-graph-qwen && npm install</p>
            
            <p className="mb-2"># Build the graph data</p>
            <p className="mb-4">npm run build:graph</p>
            
            <p className="mb-2"># Start the development server</p>
            <p>npm run dev</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Hackathon Context</h2>
          <p className="text-gray-700 mb-4">
            This project was built for the AI Agent Hackathon - The Squad Graph, hosted on TAIKAI.
            The challenge was to build a tool that visualizes and queries the connections between
            World Cup 2026 players based on their club histories.
          </p>
          <p className="text-gray-700">
            The hackathon emphasizes the use of AI agents to autonomously build complete applications
            from a dataset and specification. This project demonstrates how an AI agent can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
            <li>Analyze and process a complex dataset</li>
            <li>Design and implement a graph algorithm</li>
            <li>Build a full-stack web application with interactive visualizations</li>
            <li>Deploy the application to production</li>
            <li>Write comprehensive documentation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📄 License</h2>
          <p className="text-gray-700">
            This project is open source and available under the MIT License.
          </p>
        </section>
      </div>
    </div>
  );
}
