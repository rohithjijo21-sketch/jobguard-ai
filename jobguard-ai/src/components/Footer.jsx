import { LockKeyhole } from "lucide-react";
export default function Footer() {
  return (
    <footer>
      <div>
        <span>
          <img className="footer-logo" src="/jobguard-logo.png" alt="" width="20" height="20" />
          JobGuard AI <small>v1.0</small>
        </span>
        <span>
          <LockKeyhole size={13} />
          Job content is not saved in this browser.
        </span>
      </div>
      <p>
        AI-assisted risk assessment. Results are advisory and do not guarantee
        the legitimacy or fraudulence of a job opportunity.
      </p>
    </footer>
  );
}
