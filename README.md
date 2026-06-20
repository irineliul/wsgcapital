# SOL Staking Program

A Solana smart contract for staking SOL tokens with 100x multiplier returns after a 14-day lock period.

## 🚀 Features

- **Stake SOL**: Minimum 1 SOL staking requirement
- **100x Multiplier**: Earn 100x your staked amount after 14 days
- **Secure**: Uses Program Derived Addresses (PDAs) for user data
- **Emergency Unstake**: Option to unstake early (forfeit rewards)
- **Real Smart Contract**: Deployed on Solana Devnet

## 📋 Prerequisites

- Rust 1.70+
- Solana CLI 1.17+
- Anchor Framework 0.29+
- Node.js 18+

## 🔧 Setup

1. **Run setup script**:
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

2. **Install dependencies**:
\`\`\`bash
npm install
\`\`\`

3. **Build the program**:
\`\`\`bash
anchor build
\`\`\`

4. **Deploy to devnet**:
\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

## 🏗️ Program Structure

### Instructions

1. **stake(amount: u64)**: Stake SOL tokens
   - Minimum: 1 SOL (1,000,000,000 lamports)
   - Creates PDA account for user
   - Sets 14-day lock period

2. **claim_rewards()**: Claim 100x rewards after lock period
   - Only available after 14 days
   - Transfers 100x original amount to user
   - Marks stake as claimed

3. **emergency_unstake()**: Unstake early without rewards
   - Returns only original staked amount
   - No rewards given
   - Available anytime

### Account Structure

\`\`\`rust
pub struct UserStake {
    pub user: Pubkey,        // Owner of the stake
    pub amount: u64,         // Amount staked in lamports
    pub start_time: i64,     // Unix timestamp when staked
    pub end_time: i64,       // Unix timestamp when unlocked
    pub claimed: bool,       // Whether rewards have been claimed
}
