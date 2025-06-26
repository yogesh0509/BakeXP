use starknet::ContractAddress;

#[starknet::interface]
trait IXPTracker<TContractState> {
    fn add_xp(ref self: TContractState, user_addr: ContractAddress, amount: u256);
    fn get_xp(self: @TContractState, user_addr: ContractAddress) -> u256;
    fn log_bake(ref self: TContractState, user_addr: ContractAddress, timestamp: u64);
    fn get_streak(self: @TContractState, user_addr: ContractAddress) -> u32;
    fn get_total_bakes(self: @TContractState, user_addr: ContractAddress) -> u32;
    fn get_last_bake_timestamp(self: @TContractState, user_addr: ContractAddress) -> u64;
    fn get_level(self: @TContractState, user_addr: ContractAddress) -> u32;
}

#[starknet::contract]
mod XPTracker {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::*;
    use core::array::ArrayTrait;

    #[storage]
    struct Storage {
        user_xp: Map<ContractAddress, u256>,
        user_streaks: Map<ContractAddress, u32>,
        last_bake_timestamp: Map<ContractAddress, u64>,
        total_bakes: Map<ContractAddress, u32>,
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        XPAdded: XPAdded,
        BakeLogged: BakeLogged,
        StreakUpdated: StreakUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct XPAdded {
        #[key]
        user: ContractAddress,
        amount: u256,
        total_xp: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct BakeLogged {
        #[key]
        user: ContractAddress,
        timestamp: u64,
        streak: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct StreakUpdated {
        #[key]
        user: ContractAddress,
        old_streak: u32,
        new_streak: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
    }

    #[abi(embed_v0)]
    impl XPTrackerImpl of super::IXPTracker<ContractState> {
        fn add_xp(ref self: ContractState, user_addr: ContractAddress, amount: u256) {
            // Only owner can add XP directly (for admin purposes)
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can add XP');

            let current_xp = self.user_xp.read(user_addr);
            let new_xp = current_xp + amount;
            self.user_xp.write(user_addr, new_xp);

            self.emit(XPAdded { user: user_addr, amount, total_xp: new_xp });
        }

        fn get_xp(self: @ContractState, user_addr: ContractAddress) -> u256 {
            self.user_xp.read(user_addr)
        }

        fn log_bake(ref self: ContractState, user_addr: ContractAddress, timestamp: u64) {
            let caller = get_caller_address();
            assert(caller == user_addr, 'Can only log own bakes');

            let current_time = get_block_timestamp();
            let last_bake = self.last_bake_timestamp.read(user_addr);
            
            // Check if already baked today (assuming 24 hours = 86400 seconds)
            let one_day = 86400_u64;
            assert(current_time - last_bake >= one_day, 'Already baked today');

            // Update last bake timestamp
            self.last_bake_timestamp.write(user_addr, timestamp);

            // Update total bakes
            let total_bakes = self.total_bakes.read(user_addr);
            self.total_bakes.write(user_addr, total_bakes + 1);

            // Calculate and update streak
            let current_streak = self.user_streaks.read(user_addr);
            let new_streak = if last_bake == 0 {
                // First bake ever
                1
            } else if current_time - last_bake <= 2 * one_day {
                // Within streak window (up to 2 days)
                current_streak + 1
            } else {
                // Streak broken, reset to 1
                1
            };

            let old_streak = current_streak;
            self.user_streaks.write(user_addr, new_streak);

            // Award XP based on streak
            let base_xp = 100_u256; // Base XP per bake
            let streak_bonus = (new_streak.into() - 1) * 10_u256; // 10 XP bonus per streak day
            let total_xp_reward = base_xp + streak_bonus;

            let current_xp = self.user_xp.read(user_addr);
            let new_total_xp = current_xp + total_xp_reward;
            self.user_xp.write(user_addr, new_total_xp);

            // Emit events
            self.emit(BakeLogged { user: user_addr, timestamp, streak: new_streak });
            self.emit(StreakUpdated { user: user_addr, old_streak, new_streak });
            self.emit(XPAdded { user: user_addr, amount: total_xp_reward, total_xp: new_total_xp });
        }

        fn get_streak(self: @ContractState, user_addr: ContractAddress) -> u32 {
            let current_time = get_block_timestamp();
            let last_bake = self.last_bake_timestamp.read(user_addr);
            let current_streak = self.user_streaks.read(user_addr);

            // Check if streak is still valid (within 2 days)
            if last_bake == 0 || current_time - last_bake > 2 * 86400_u64 {
                0
            } else {
                current_streak
            }
        }

        fn get_total_bakes(self: @ContractState, user_addr: ContractAddress) -> u32 {
            self.total_bakes.read(user_addr)
        }

        fn get_last_bake_timestamp(self: @ContractState, user_addr: ContractAddress) -> u64 {
            self.last_bake_timestamp.read(user_addr)
        }

        fn get_level(self: @ContractState, user_addr: ContractAddress) -> u32 {
            let xp = self.user_xp.read(user_addr);
            // Level calculation: level = sqrt(XP / 100)
            let level_base = xp / 100_u256;
            self._sqrt(level_base).try_into().unwrap_or(1)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _sqrt(self: @ContractState, value: u256) -> u256 {
            if value == 0 {
                return 0;
            }
            
            let mut x = value;
            let mut y = (value + 1) / 2;
            
            while y < x {
                x = y;
                y = (y + value / y) / 2;
            }
            
            x
        }
    }
}