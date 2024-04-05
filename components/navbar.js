//reusable HTML component for header nav bar

class NavBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <header>
        <nav>
          <ul>
            <li><a href="index.html"><img src="img/projecteatz-logo-only.png"/></a></li>
            <li><a href="main-menu.html">Main Menu</a></li>
            <li><a href="my-profile.html">My Profile</a></li>
            <li><a id="signoutLink" href="#">Sign Out</a></li>
          </ul>
        </nav>
      </header>
    `;
  }
}

customElements.define('navbar-component', NavBar);

//<a href="main-menu.html"><img src="img/projecteatz-logo-only.png" width="30" height="30"></a>