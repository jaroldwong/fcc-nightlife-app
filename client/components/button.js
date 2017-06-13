const React = require('react');
const axios = require('axios');

class Button extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      going: false,
      total: 0,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  addToGuests() {
    axios.put('/location/guests', {
      guest: 'myId',
    })
      .then((response) => {
        const total = response.data.guests.length;
        this.setState(() => ({ total }));
      });
  }

  removeFromGuests() {
    axios.delete('/location/guests', {
      guest: 'myId',
    })
      .then((response) => {
        const total = response.data.guests.length;
        this.setState(() => ({ total }));
      });
  }

  handleClick() {
    if (!this.state.going) {
      this.addToGuests();
    } else {
      this.removeFromGuests();
    }

    this.setState(() => ({ going: !this.state.going }));
  }

  render() {
    return (
      <div className="button">
        {!this.state.going
          ? <button onClick={this.handleClick}>I&#39;m Going</button>
          : <button onClick={this.handleClick}>{this.state.total} going!</button>
        }
      </div>
    );
  }
}

module.exports = Button;
