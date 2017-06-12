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
    const searchUrl = `/${term}`;

    axios.get(searchUrl)
    .then((response) => {
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
      <div className="container">
        <div className="header">
          <h1>Flock Together</h1>
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
