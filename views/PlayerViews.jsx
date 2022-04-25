import React from 'react';

const exports = {};

exports.GetParams = class extends React.Component {
  render() {
    const contribution = (this.state || {}).contribution || defaultContribution;
    const numOfBackers = (this.state || {}).numOfBackers || backers;
    const {parent, defaultContribution, standardUnit, backers} = this.props;
    return (
      <div>
        <input
          type='number'
          placeholder={defaultContribution}
          onChange={(e) => this.setState({contribution: e.currentTarget.value})}
        /> {standardUnit}
        <br />
        <button
          onClick={() => parent.setContribution(contribution)}
        >Set Cotribution</button>
        <br />
        <input
          type='number'
          placeholder={backers}
          onChange={(e) => this.setState({numOfBackers: e.currentTarget.value})}
        /> 
        <br />
        <button
          onClick={() => parent.setNumOfBackers(e.currentTarget.value)}
        >Set Backers</button>
      </div>
    );
  }
}

exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    return (
      <div>
        Thank you for participating. Your bonus is:
        <br />{outcome || 'Unknown'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

export default exports;