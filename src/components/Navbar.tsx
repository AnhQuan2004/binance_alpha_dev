import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-background border-b border-border/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/airdrops"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
              }`
            }
          >
            Airdrops
          </NavLink>
      </div>
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-20" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
