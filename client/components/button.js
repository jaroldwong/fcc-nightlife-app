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
    const businessId = this.props.businessId;
    const jwt = document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    axios.post(`http://localhost:3000/${businessId}/guests`, {}, {
      headers: { authorization: jwt } },
    )
      .then((response) => {
        const total = response.data.guests.length;
        this.setState(() => ({ total }));
      });
  }

  removeFromGuests() {
    const businessId = this.props.businessId;
    const jwt = document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    axios.delete(`http://localhost:3000/${businessId}/guests`, {
      headers: { authorization: jwt },
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
