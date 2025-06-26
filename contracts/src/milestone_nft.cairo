use starknet::ContractAddress;

#[starknet::interface]
trait IMilestoneNFT<TContractState> {
    fn mint_milestone(ref self: TContractState, user_addr: ContractAddress, milestone_id: u32);
    fn get_user_milestones(self: @TContractState, user_addr: ContractAddress) -> Array<u32>;
    fn has_milestone(self: @TContractState, user_addr: ContractAddress, milestone_id: u32) -> bool;
    fn get_milestone_metadata(self: @TContractState, milestone_id: u32) -> ByteArray;
    fn check_and_mint_eligible_milestones(ref self: TContractState, user_addr: ContractAddress);
    fn set_xp_tracker_contract(ref self: TContractState, new_contract: ContractAddress);
}

#[starknet::interface]
trait IXPTracker<TContractState> {
    fn get_xp(self: @TContractState, user_addr: ContractAddress) -> u256;
    fn get_streak(self: @TContractState, user_addr: ContractAddress) -> u32;
    fn get_total_bakes(self: @TContractState, user_addr: ContractAddress) -> u32;
    fn get_level(self: @TContractState, user_addr: ContractAddress) -> u32;
}

#[derive(Drop, Serde)]
struct MilestoneInfo {
    id: u32,
    name: ByteArray,
    description: ByteArray,
    earned: bool,
}

#[starknet::contract]
mod MilestoneNFT {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::*;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::access::ownable::OwnableComponent;
    use core::array::ArrayTrait;
    use core::traits::Into;
    use super::{IXPTrackerDispatcher, IXPTrackerDispatcherTrait};

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // ERC721 Mixin
    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        user_milestones: Map<(ContractAddress, u32), bool>, // (user, milestone_id) -> earned
        milestone_metadata: Map<u32, ByteArray>, // milestone_id -> metadata URI
        next_token_id: u256,
        xp_tracker_contract: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        MilestoneMinted: MilestoneMinted,
    }

    #[derive(Drop, starknet::Event)]
    struct MilestoneMinted {
        #[key]
        user: ContractAddress,
        milestone_id: u32,
        token_id: u256,
    }

    // Milestone IDs
    const FIRST_BAKE: u32 = 1;
    const STREAK_3: u32 = 2;
    const STREAK_7: u32 = 3;
    const STREAK_30: u32 = 4;
    const STREAK_100: u32 = 5;
    const LEVEL_5: u32 = 6;
    const LEVEL_10: u32 = 7;
    const LEVEL_25: u32 = 8;
    const TOTAL_BAKES_50: u32 = 9;
    const TOTAL_BAKES_100: u32 = 10;

    #[constructor]
    fn constructor(
        ref self: ContractState, 
        owner: ContractAddress,
        xp_tracker_contract: ContractAddress
    ) {
        let name = "BakeXP Milestones";
        let symbol = "BXPM";
        let base_uri = "https://api.bakexp.com/metadata/";

        self.erc721.initializer(name, symbol, base_uri);
        self.ownable.initializer(owner);
        self.xp_tracker_contract.write(xp_tracker_contract);
        self.next_token_id.write(1);

        // Initialize milestone metadata
        self._initialize_milestone_metadata();
    }

    #[abi(embed_v0)]
    impl MilestoneNFTImpl of super::IMilestoneNFT<ContractState> {
        fn mint_milestone(ref self: ContractState, user_addr: ContractAddress, milestone_id: u32) {
            // Only the contract owner or XP tracker can mint milestones
            let caller = get_caller_address();
            let owner = self.ownable.owner();
            let xp_tracker = self.xp_tracker_contract.read();
            
            assert(caller == owner || caller == xp_tracker, 'Unauthorized minting');

            // Check if user already has this milestone
            assert(!self.user_milestones.read((user_addr, milestone_id)), 'Milestone already earned');

            // Verify milestone eligibility
            assert(self._check_milestone_eligibility(user_addr, milestone_id), 'Milestone not eligible');

            // Mark milestone as earned
            self.user_milestones.write((user_addr, milestone_id), true);

            // Mint NFT
            let token_id = self.next_token_id.read();
            self.erc721.mint(user_addr, token_id);
            self.next_token_id.write(token_id + 1);

            self.emit(MilestoneMinted { user: user_addr, milestone_id, token_id });
        }

        fn get_user_milestones(self: @ContractState, user_addr: ContractAddress) -> Array<u32> {
            let mut earned_milestones = ArrayTrait::new();
            let milestone_ids = self._get_all_milestone_ids();
            
            let mut i = 0;
            while i < milestone_ids.len() {
                let milestone_id = *milestone_ids.at(i);
                if self.user_milestones.read((user_addr, milestone_id)) {
                    earned_milestones.append(milestone_id);
                }
                i += 1;
            };
            
            earned_milestones
        }

        fn has_milestone(self: @ContractState, user_addr: ContractAddress, milestone_id: u32) -> bool {
            self.user_milestones.read((user_addr, milestone_id))
        }

        fn get_milestone_metadata(self: @ContractState, milestone_id: u32) -> ByteArray {
            self.milestone_metadata.read(milestone_id)
        }

        fn check_and_mint_eligible_milestones(ref self: ContractState, user_addr: ContractAddress) {
            let milestone_ids = self._get_all_milestone_ids();
            
            let mut i = 0;
            while i < milestone_ids.len() {
                let milestone_id = *milestone_ids.at(i);
                if !self.user_milestones.read((user_addr, milestone_id)) 
                    && self._check_milestone_eligibility(user_addr, milestone_id) {
                    self.mint_milestone(user_addr, milestone_id);
                }
                i += 1;
            };
        }

        fn set_xp_tracker_contract(ref self: ContractState, new_contract: ContractAddress) {
            self.ownable.assert_only_owner();
            self.xp_tracker_contract.write(new_contract);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _initialize_milestone_metadata(ref self: ContractState) {
            self.milestone_metadata.write(FIRST_BAKE, "first_bake.json");
            self.milestone_metadata.write(STREAK_3, "streak_3.json");
            self.milestone_metadata.write(STREAK_7, "streak_7.json");
            self.milestone_metadata.write(STREAK_30, "streak_30.json");
            self.milestone_metadata.write(STREAK_100, "streak_100.json");
            self.milestone_metadata.write(LEVEL_5, "level_5.json");
            self.milestone_metadata.write(LEVEL_10, "level_10.json");
            self.milestone_metadata.write(LEVEL_25, "level_25.json");
            self.milestone_metadata.write(TOTAL_BAKES_50, "total_bakes_50.json");
            self.milestone_metadata.write(TOTAL_BAKES_100, "total_bakes_100.json");
        }

        fn _get_all_milestone_ids(self: @ContractState) -> Array<u32> {
            let mut milestone_ids = ArrayTrait::new();
            milestone_ids.append(FIRST_BAKE);
            milestone_ids.append(STREAK_3);
            milestone_ids.append(STREAK_7);
            milestone_ids.append(STREAK_30);
            milestone_ids.append(STREAK_100);
            milestone_ids.append(LEVEL_5);
            milestone_ids.append(LEVEL_10);
            milestone_ids.append(LEVEL_25);
            milestone_ids.append(TOTAL_BAKES_50);
            milestone_ids.append(TOTAL_BAKES_100);
            milestone_ids
        }

        fn _check_milestone_eligibility(
            self: @ContractState, 
            user_addr: ContractAddress, 
            milestone_id: u32
        ) -> bool {
            let xp_tracker = IXPTrackerDispatcher { 
                contract_address: self.xp_tracker_contract.read() 
            };

            if milestone_id == FIRST_BAKE {
                xp_tracker.get_total_bakes(user_addr) >= 1
            } else if milestone_id == STREAK_3 {
                xp_tracker.get_streak(user_addr) >= 3
            } else if milestone_id == STREAK_7 {
                xp_tracker.get_streak(user_addr) >= 7
            } else if milestone_id == STREAK_30 {
                xp_tracker.get_streak(user_addr) >= 30
            } else if milestone_id == STREAK_100 {
                xp_tracker.get_streak(user_addr) >= 100
            } else if milestone_id == LEVEL_5 {
                xp_tracker.get_level(user_addr) >= 5
            } else if milestone_id == LEVEL_10 {
                xp_tracker.get_level(user_addr) >= 10
            } else if milestone_id == LEVEL_25 {
                xp_tracker.get_level(user_addr) >= 25
            } else if milestone_id == TOTAL_BAKES_50 {
                xp_tracker.get_total_bakes(user_addr) >= 50
            } else if milestone_id == TOTAL_BAKES_100 {
                xp_tracker.get_total_bakes(user_addr) >= 100
            } else {
                false
            }
        }
    }
}