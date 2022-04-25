import React from 'react';
import AppViews from './views/AppViews';
import AdminViews from './views/AdminViews';
import BackerViews from './views/BackerViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
const reach = loadStdlib(process.env);

const backers = 10;
const stdlib = loadStdlib();
const {connector} = stdlib;
const startingBalance = stdlib.parseCurrency(100);
const accAdmin = await stdlib.newTestAccount(startingBalance);
const backersArray = await Promise.all(
  Array.from({length: backers}, () => 
    stdlib.newTestAccount(startingBalance)
  )
);

const ctcAdmin = accAdmin.contract(backend);
const ctcInfo = ctcAdmin.getInfo();

const adminParams = {
  contribution: stdlib.parseCurrency(3),
  deadline: connector === 'ALGO' ? 4 : 8,
};

const resultText = (outcome, addr) => 
  outcome.includes(addr) ? 'contributed' : 'did not contribute';

const contributionHistory = {};
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultContribution: '3', standardUnit};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};
  }
  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({acc, bal});
    if (await reach.canFundFromFaucet()) {
      this.setState({view: 'FundAccount'});
    } else {
      this.setState({view: 'AdminOrBacker'});
    }
  }
  async fundAccount(fundAmount) {
    await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({view: 'AdminOrBacker'});
  }
  async skipFundAccount() { this.setState({view: 'AdminOrBacker'}); }
  selectAttacher() { this.setState({view: 'Wrapper', ContentView: Backer}); }
  selectDeployer() { this.setState({view: 'Wrapper', ContentView: Admin}); }
  render() { return renderView(this, AppViews); }
}

class Player extends React.Component {
  random() { return reach.hasRandom.random(); }
  async getParams() { // Fun([], UInt)
    const accAdmin = await stdlib.newTestAccount(startingBalance);
    const backersArray = await Promise.all(
      Array.from({length: backers}, () => 
        stdlib.newTestAccount(startingBalance)
      )
    );

    const ctcAdmin = accAdmin.contract(backend);
    const ctcInfo = ctcAdmin.getInfo();

    const adminParams = {
      contribution: stdlib.parseCurrency(3),
      deadline: connector === 'ALGO' ? 4 : 8,
    };

    const resultText = (outcome, addr) => 
      outcome.includes(addr) ? 'contributed' : 'did not contribute';

    const contributionHistory = {};

    await Promise.all([
      backend.Admin(ctcAdmin, {
        showOutcome: (outcome) => 
          console.log(`Admin confirms ${resultText(outcome, accAdmin.getAddress())}`),
          getParams: () => adminParams,
      })
      ].concat(
        backersArray.map((accBacker, i) => {
          const ctcBacker = accBacker.contract(backend, ctcInfo);
          const Who = `Contributor ${i}`;
          return backend.Backer(ctcBacker, {
            showOutcome: (outcome) => 
              console.log(`${Who} confirm they ${resultText(outcome, accBacker.getAddress())}`),
            shouldBackCampaign: () => !contributionHistory[Who] && Math.random() < 0.5,
            showContribution: (addr) => {
              if(stdlib.addressEq(addr, accBacker)) {
                console.log(`${Who} contributed.`);
                contributionHistory[Who] = true;
              }
            }
          })
        })
      )
    )



  //   const hand = await new Promise(resolveHandP => {
  //     this.setState({view: 'GetHand', playable: true, resolveHandP});
  //   });
  //   this.setState({view: 'WaitingForResults', hand});
  //   return handToInt[hand];
  // }
  // seeOutcome(i) { this.setState({view: 'Done', outcome: intToOutcome[i]}); }
  // informTimeout() { this.setState({view: 'Timeout'}); }
  // playHand(hand) { this.state.resolveHandP(hand); }
}}

class Admin extends Player {
  constructor(props) {
    super(props);
    this.state = {view: 'SetWagerSetMinimumContribution'};
  }
  setContribution(contribution) { this.setState({view: 'Admin', contribution}); }
  async deploy() {
    const ctc = this.props.acc.contract(backend);
    this.setState({view: 'Deploying', ctc});
    this.contribution = reach.parseCurrency(this.state.contribution); // UInt
    this.deadline = {ETH: 10, ALGO: 100, CFX: 1000}[reach.connector]; // UInt
    backend.Admin(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({view: 'WaitingForBackers', ctcInfoStr});
  }
  render() { return renderView(this, AdminViews); }
}
class Backer extends Player {
  constructor(props) {
    super(props);
    this.state = {view: 'Attach'};
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr));
    this.setState({view: 'Attaching'});
    backend.Backer(ctc, this);
  }
  async acceptContribution(contributionAtomic) { // Fun([UInt], Null)
    const contribution = reach.formatCurrency(contributionAtomic, 4);
    return await new Promise(resolveAcceptedP => {
      this.setState({view: 'AcceptTerms', contribution, resolveAcceptedP});
    });
  }
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({view: 'WaitingForTurn'});
  }
  render() { return renderView(this, AttacherViews); }
}

renderDOM(<App />);
