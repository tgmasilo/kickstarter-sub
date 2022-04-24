'reach 0.1';
'use strict';

// Campaign should have fixed number of backers
const NUM_OF_BACKERS = 3;

const CommonInterface = {
  showResult: Fun([Array(Address, NUM_OF_BACKERS)], Null),
};

const AdminInterface = {
  ...CommonInterface,
  getParams: Fun([], Object({
    deadline: UInt, // relative deadline
    minimumContribution: UInt,
  })),
};

const BackerInterface = {
  ...CommonInterface,
  shouldBackCampaign: Fun([UInt], Bool),
  showContribution: Fun([Address], Null),
};

export const main = Reach.App(
  { },
  [
    Participant('Admin', AdminInterface), ParticipantClass('Backer', BackerInterface),
  ],
  (Admin, Backer) => {
    const showResult = (backers) =>
      each([Admin, Backer], () => interact.showResult(backers));

    Admin.only(() => {
      const { minimumContribution, deadline } = declassify(interact.getParams()); });
    Admin.publish(minimumContribution, deadline);

    const initialBackers = Array.replicate(NUM_OF_BACKERS, Admin);

    // Until deadline, allow backers to contribute to the campaign
    const [ keepGoing, backers, contributions ] =
      parallelReduce([ true, initialBackers, 0 ])
        .invariant(balance() == contributions * minimumContribution)
        .while(keepGoing)
        .case(
          Backer,
          () => ({
            when: declassify(interact.shouldBackCampaign(minimumContribution)) }),
          (_) => minimumContribution,
          (_) => {
            const backer = this;
            Backer.only(() => interact.showContribution(backer));
            const idx = contributions % NUM_OF_BACKERS;
            const bonusWinners =
              Array.set(backers, idx, backer);
            return [ true, bonusWinners, contributions + 1 ]; })
        .timeout(relativeTime(deadline), () => {
          Anybody.publish();
          return [ false, backers, contributions ]; });

    transfer(balance() % NUM_OF_BACKERS).to(Admin);
    const bonus = balance() / NUM_OF_BACKERS;

    backers.forEach(backer =>
      transfer(bonus).to(backer));

    commit();
    showResult(backers);
});