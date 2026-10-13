import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function QuickAction({ icon, title, subtitle, link }) {
  return (
    <Link to={link} className="quick-card">

      <div className="quick-icon">
        {icon}
      </div>

      <div className="quick-info">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <ArrowUpRight
        className="quick-arrow"
        size={18}
      />

    </Link>
  );
}

export default QuickAction;