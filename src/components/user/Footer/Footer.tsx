import API from "../../../shared/constants/API";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="user-footer">
      <div className="user-footer-container">
        <div>
          <div className="user-footer-logo">
            <strong className="logo">SkillForge</strong>
            <p>skillforge4202@gmail.com</p>
            <p>Brocamp, Ernakulam</p>
            <p>+91 8848746391</p>

            <div className="user-footer-social">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
              ></a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
              ></a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noreferrer"
              ></a>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="user-footer-links">
          <div className="user-footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href={API.SUBSCRIPTION_GET}>Subscribe Now!</a>
              </li>
              <li>
                <a href={API.COURSE_GET}>Courses</a>
              </li>
            </ul>
          </div>
          <div className="user-footer-column">
            <h4>Top 5 Categories</h4>
            <ul>
              <li>
                <a href="/category/1">Design</a>
              </li>
              <li>
                <a href="/category/2">Development</a>
              </li>
              <li>
                <a href="/category/3">Marketing</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="user-footer-copyright">
        © 2024 SkillForge. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
