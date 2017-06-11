var React = require('react');
var ReactDOM = require('react-dom');
const axios = require('axios');

require('./style.css');

class App extends React.Component {
  render() {
    return(
        <div className="container">
            <div className="header">
              <h1>Flock Together</h1>
              <input type="text" placeholder="Where are you going?" />
              <input type="submit" value="Search" />
            </div>
            <Venues />
        </div>
    );
  }
}

class Venues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      businesses: null,
    };
  }

  componentDidMount() {
    axios.get('http://localhost:3000')
    .then(response => {
      this.setState(() => {
        return {
          businesses: response.data,
        }
      })
    });
  }
  render() {
    return(
      <ul>
        {!this.state.businesses
          ? <p>LOADING...</p>
          : this.state.businesses.map((business) => {
          return (
            <li key={business.id} className="listing">
              <h2><a href={business.url}>{business.name}</a></h2>
              <img src={business.image_url} width="150px" />
            </li>
          )
        })}

      </ul>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
