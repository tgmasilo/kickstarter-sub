import React from 'react';
import PlayerViews from './PlayerViews';

const exports = {...PlayerViews};

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      <div className="Attacher">
        <h2>Please back this campaign to earn bonuses</h2>
        {content}
      </div>
    );
  }
}

exports.Attach = class extends React.Component {
  render() {
    const {parent} = this.props;
    const {ctcInfoStr} = this.state || {};
    return (
      <div>
        Please paste the contract info to attach to:
        <br />
        <textarea spellCheck="false"
          className='ContractInfo'
          onChange={(e) => this.setState({ctcInfoStr: e.currentTarget.value})}
          placeholder='{}'
        />
        <br />
        <button
          disabled={!ctcInfoStr}
          onClick={() => parent.attach(ctcInfoStr)}
        >Attach</button>
      </div>
    );
  }
}

exports.Attaching = class extends React.Component {
  render() {
    return (
      <div>
        Joining you, please wait...
      </div>
    );
  }
}

exports.AcceptTerms = class extends React.Component {
  render() {
    const {minimumContribution, standardUnit, parent} = this.props;
    const {disabled} = this.state || {};
    return (
      <div>
        <h2>Please pay minimum contribution below:</h2>
        <br /> Contribution: {minimumContribution} {standardUnit}
        <br />
        <button
          disabled={disabled}
          onClick={() => {
            this.setState({disabled: true});
            parent.termsAccepted();
          }}
        >Pay Contribution</button>
      </div>
    );
  }
}

exports.WaitingForTurn = class extends React.Component {
  render() {
    return (
      <div>
        <h2>Waiting for payment to be completed...</h2>
      </div>
    );
  }
}

export default exports;