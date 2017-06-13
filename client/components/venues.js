const React = require('react');
const PropTypes = require('prop-types');
const Button = require('./button');

const Venues = (props) => {
  return (
    <ul>
      {!props.businesses
        ? <p>Waiting...</p>
        : props.businesses.map((business) => {
          return (
            <li key={business.id} className="listing">
              <h2><a href={business.url}>{business.name}</a></h2>
              <img src={business.image_url} alt={business.name} height="150px" width="150px" />
              <Button />
            </li>
          );
        })
      }
    </ul>
  );
};

Venues.propTypes = {
  businesses: PropTypes.array.isRequired,
};

module.exports = Venues;
