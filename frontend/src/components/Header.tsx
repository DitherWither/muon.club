import { Link } from '@tanstack/react-router';

export default function Header() {
  return (
    <header className="p-4 flex items-center bg-gray-100 dark:bg-gray-800 justify-between">
      <nav className="flex flex-row">
        <div className="text-4xl font-thin bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          <Link to="/chat">muon.club</Link>
        </div>
      </nav>
    </header>
  );
}
