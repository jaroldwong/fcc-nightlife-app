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

  getToken() {
    const data = {
      username: 'bob',
      password: 'password',
    }

    axios.post('http://localhost:3000/login', data)
      .then((response) => {
      localStorage.setItem('token', response.data.token);
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
      <div className="container">
        <button onClick={this.testLogin}>Get a token</button>      
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
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
