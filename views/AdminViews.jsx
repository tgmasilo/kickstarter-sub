import React from 'react';
import PlayerViews from './PlayerViews';

const exports = {...PlayerViews};

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      <div className="Deployer">
        <h2>Backer - Contribute to the campaign</h2>
        {content}
      </div>
    );
  }
}

exports.SetMinimumContribution = class extends React.Component {
  render() {
    const {parent, defaultContribution, standardUnit} = this.props;
    const contribution = (this.state || {}).contribution || defaultContribution;
    return (
      <div>
        <input
          type='number'
          placeholder={defaultWager}
          onChange={(e) => this.setState({contribution: e.currentTarget.value})}
        /> {standardUnit}
        <br />
        <button
          onClick={() => parent.setContribution(contribution)}
        >Set wager</button>
      </div>
    );
  }
}

exports.Deploy = class extends React.Component {
  render() {
    const {parent, contribution, standardUnit} = this.props;
    return (
      <div>
        Contribution to pay: <strong>{contribution}</strong> {standardUnit}
        <br />
        <button
          onClick={() => parent.deploy()}
        >Deploy</button>
      </div>
    );
  }
}

exports.Deploying = class extends React.Component {
  render() {
    return (
      <div>Deploying... please wait.</div>
    );
  }
}

exports.WaitingForBackers = class extends React.Component {
  async copyToClipboard(button) {
    const {ctcInfoStr} = this.props;
    navigator.clipboard.writeText(ctcInfoStr);
    const origInnerHTML = button.innerHTML;
    button.innerHTML = 'Copied!';
    button.disabled = true;
    await sleep(1000);
    button.innerHTML = origInnerHTML;
    button.disabled = false;
  }

  render() {
    const {ctcInfoStr} = this.props;
    return (
      <div>
        Waiting for contributions to join...
        <br /> Make sure you share this contract info:
        <pre className='ContractInfo'>
          {ctcInfoStr}
        </pre>
        <button
          onClick={(e) => this.copyToClipboard(e.currentTarget)}
        >Copy to clipboard</button>
      </div>
    )
  }
}

export default exports;