// @flow

function present(plan: *) {
  return {
    id: plan.id,
    name: plan.nickname,
    amount: plan.amount,
    period: plan.interval,
    formattedAmount: `$${(plan.amount / 100).toFixed(2)}`,
  };
}

export default present;
