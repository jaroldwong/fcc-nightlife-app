const React = require('react');
const ReactDOM = require('react-dom');
const axios = require('axios');

const Venues = require('./components/venues');

require('./style.css');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      businesses: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  fetchVenues(term) {
    const searchUrl = `http://localhost:3000/${term}`;

    axios.get(searchUrl)
    .then((response) => {
      this.setState(() => ({ businesses: response.data }));
    });
  }

  facebookAuth() {
    const authUrl = 'https://www.facebook.com/v2.9/dialog/oauth?client_id=1958298761080188&redirect_uri=http://localhost:8080&response_type=token';
    const options = 'width=500, height=500';

    // open popup and inject script to send code back
    const popup = window.open(authUrl, 'Facebook Authentication', options);
    const script = document.createElement('script');
    function injectScript() {
      // const accessToken = window.location.hash.split('=')[1].split('&')[0];
      const re = /access_token=([^&]+)(?:&expires=(.*))?/;
      const accessToken = re.exec(window.location.href)[1];
      window.opener.postMessage(accessToken, window.location.origin);
    }
    script.innerHTML = 'window.addEventListener("load", ' + injectScript.toString() + ');';
    popup.document.body.appendChild(script);


    window.addEventListener('message', (event) => {
      if (event.origin === window.location.origin) {
        const token = event.data;
        axios.post('http://localhost:3000/auth/facebook', { token })
          .then((response) => {
            sessionStorage.setItem('jwt', response.data);
          });
        popup.close();
      }
    });
  }

  handleChange(event) {
    const value = event.target.value;

    this.setState(() => ({ searchTerm: value }));
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState(() => ({ businesses: null }));
    this.fetchVenues(this.state.searchTerm);
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <button
              onClick={this.facebookAuth}
              className="btn btn-primary navbar-btn navbar-right"
            >
              Continue with Facebook
            </button>
          </div>
        </nav>
        <div className="container">
          <div className="header">
            <h1>Swarme</h1>
            <p>Find out where everyone is going tonight</p>
            <form onSubmit={this.handleSubmit}>
              <input
                type="text"
                placeholder="Where to?"
                value={this.state.searchTerm}
                onChange={this.handleChange}
              />
              <input type="submit" value="Search" />
            </form>
          </div>
          <Venues businesses={this.state.businesses} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
