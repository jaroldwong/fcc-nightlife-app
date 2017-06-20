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

  componentWillMount() {
    const savedResults = JSON.parse(sessionStorage.getItem('savedResults'));
    if (savedResults) {
      this.setState(() => (savedResults));
    }
  }

  fetchVenues(location) {
    const searchUrl = `/${location}`;

    axios.get(searchUrl)
    .then((response) => {
      sessionStorage.setItem('savedResults', JSON.stringify({ businesses: response.data }));
      this.setState(() => ({ businesses: response.data }));
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
            <a
              href="http://localhost:3000/auth/twitter"
              className="navbar-btn navbar-right btn btn-primary"
            >
              Login with Twitter
            </a>
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
