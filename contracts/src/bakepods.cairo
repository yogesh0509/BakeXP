use starknet::ContractAddress;


#[derive(Drop, Serde, starknet::Store)]
pub struct Pod {
    pub id: u32,
    pub name: ByteArray,
    pub description: ByteArray,
    pub creator: ContractAddress,
    pub member_limit: u32,
    pub created_at: u64,
    pub is_active: bool,
    pub current_streak: u32,
    pub target_streak: u32,
}

#[derive(Drop, Serde)]
pub struct PodStats {
    pub pod_id: u32,
    pub total_bakes: u32,
    pub member_count: u32,
    pub daily_bakes_today: u32,
    pub current_streak: u32,
    pub target_streak: u32,
    pub is_active: bool,
}

#[starknet::interface]
trait IBakePods<TContractState> {
    fn create_pod(
        ref self: TContractState,
        pod_name: ByteArray,
        target_streak: u32,
        max_members: u32
    ) -> u32;
    fn join_pod(ref self: TContractState, pod_id: u32);
    fn leave_pod(ref self: TContractState, pod_id: u32);
    fn log_pod_bake(ref self: TContractState, pod_id: u32);
    fn get_pod(self: @TContractState, pod_id: u32) -> Pod;
    fn get_pod_members(self: @TContractState, pod_id: u32) -> Array<ContractAddress>;
    fn get_user_pods(self: @TContractState, user: ContractAddress) -> Array<u32>;
    fn check_pod_milestone(self: @TContractState, pod_id: u32) -> Array<ByteArray>;
    fn get_pod_stats(self: @TContractState, pod_id: u32) -> PodStats;
    fn has_user_baked_today_in_pod(self: @TContractState, pod_id: u32, user: ContractAddress) -> bool;
    fn deactivate_pod(ref self: TContractState, pod_id: u32);
}

#[starknet::contract]
mod BakePods {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::*;
    use core::array::ArrayTrait;
    use super::{Pod, PodStats};

    #[storage]
    struct Storage {
        pod_counter: u32,
        pods: Map<u32, Pod>,
        pod_members: Map<(u32, ContractAddress), bool>,
        pod_member_count: Map<u32, u32>,
        pod_member_list: Map<(u32, u32), ContractAddress>,
        user_pods: Map<(ContractAddress, u32), u32>,
        user_pod_count: Map<ContractAddress, u32>,
        pod_bakes: Map<(u32, ContractAddress, u64), bool>,
        pod_daily_bakes: Map<(u32, u64), u32>,
        pod_total_bakes: Map<u32, u32>,
        xp_tracker_contract: ContractAddress,
        milestone_nft_contract: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PodCreated: PodCreated,
        MemberJoined: MemberJoined,
        MemberLeft: MemberLeft,
        PodBakeLogged: PodBakeLogged,
        PodMilestoneReached: PodMilestoneReached,
        PodStreakUpdated: PodStreakUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct PodCreated {
        #[key]
        pod_id: u32,
        #[key]
        creator: ContractAddress,
        name: ByteArray,
        target_streak: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct MemberJoined {
        #[key]
        pod_id: u32,
        #[key]
        user: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct MemberLeft {
        #[key]
        pod_id: u32,
        #[key]
        user: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct PodBakeLogged {
        #[key]
        pod_id: u32,
        #[key]
        user: ContractAddress,
        day: u64,
        pod_daily_count: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct PodMilestoneReached {
        #[key]
        pod_id: u32,
        milestone_type: ByteArray,
        value: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct PodStreakUpdated {
        #[key]
        pod_id: u32,
        old_streak: u32,
        new_streak: u32,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        xp_tracker_contract: ContractAddress,
        milestone_nft_contract: ContractAddress
    ) {
        self.pod_counter.write(0);
        self.xp_tracker_contract.write(xp_tracker_contract);
        self.milestone_nft_contract.write(milestone_nft_contract);
    }

    #[abi(embed_v0)]
    impl BakePodsImpl of super::IBakePods<ContractState> {
        fn create_pod(
            ref self: ContractState,
            pod_name: ByteArray,
            target_streak: u32,
            max_members: u32
        ) -> u32 {
            let creator = get_caller_address();
            let pod_id = self.pod_counter.read() + 1;
            self.pod_counter.write(pod_id);

            let pod = Pod {
                id: pod_id,
                name: pod_name.clone(),
                description: "",
                creator,
                member_limit: max_members,
                created_at: get_block_timestamp(),
                is_active: true,
                current_streak: 0,
                target_streak,
            };

            self.pods.write(pod_id, pod);

            // Add creator as first member
            self._add_member_to_pod(pod_id, creator);

            self.emit(PodCreated { pod_id, creator, name: pod_name, target_streak });

            pod_id
        }

        fn join_pod(ref self: ContractState, pod_id: u32) {
            let user = get_caller_address();
            let pod = self.pods.read(pod_id);
            
            assert(pod.is_active, 'Pod is not active');
            assert(!self.pod_members.read((pod_id, user)), 'Already a member');
            
            let current_member_count = self.pod_member_count.read(pod_id);
            assert(current_member_count < pod.member_limit, 'Pod is full');

            self._add_member_to_pod(pod_id, user);

            self.emit(MemberJoined { pod_id, user });
        }

        fn leave_pod(ref self: ContractState, pod_id: u32) {
            let user = get_caller_address();
            assert(self.pod_members.read((pod_id, user)), 'Not a member');

            self._remove_member_from_pod(pod_id, user);

            self.emit(MemberLeft { pod_id, user });
        }

        fn log_pod_bake(ref self: ContractState, pod_id: u32) {
            let user = get_caller_address();
            assert(self.pod_members.read((pod_id, user)), 'Not a member of pod');

            let current_day = self._get_current_day();
            assert(!self.pod_bakes.read((pod_id, user, current_day)), 'Already baked today in pod');

            // Log the bake
            self.pod_bakes.write((pod_id, user, current_day), true);

            // Update daily count
            let daily_count = self.pod_daily_bakes.read((pod_id, current_day));
            self.pod_daily_bakes.write((pod_id, current_day), daily_count + 1);

            // Update total bakes
            let total_bakes = self.pod_total_bakes.read(pod_id);
            self.pod_total_bakes.write(pod_id, total_bakes + 1);

            // Update pod streak
            self._update_pod_streak(pod_id);

            self.emit(PodBakeLogged { pod_id, user, day: current_day, pod_daily_count: daily_count + 1 });
        }

        fn get_pod(self: @ContractState, pod_id: u32) -> Pod {
            let pod = self.pods.read(pod_id);
            pod
        }

        fn get_pod_members(self: @ContractState, pod_id: u32) -> Array<ContractAddress> {
            let mut members = ArrayTrait::new();
            let member_count = self.pod_member_count.read(pod_id);
            
            let mut i = 0;
            while i < member_count {
                let member = self.pod_member_list.read((pod_id, i));
                members.append(member);
                i += 1;
            };
            
            members
        }

        fn get_user_pods(self: @ContractState, user: ContractAddress) -> Array<u32> {
            let mut user_pods = ArrayTrait::new();
            let pod_count = self.user_pod_count.read(user);
            
            let mut i = 0;
            while i < pod_count {
                let pod_id = self.user_pods.read((user, i));
                user_pods.append(pod_id);
                i += 1;
            };
            
            user_pods
        }

        fn check_pod_milestone(self: @ContractState, pod_id: u32) -> Array<ByteArray> {
            let mut milestones = ArrayTrait::new();
            let pod = self.pods.read(pod_id);
            let total_bakes = self.pod_total_bakes.read(pod_id);
            let member_count = self.pod_member_count.read(pod_id);

            // Check various milestone criteria
            if pod.current_streak >= 7 {
                milestones.append("7_day_streak");
            }
            if pod.current_streak >= 30 {
                milestones.append("30_day_streak");
            }
            if total_bakes >= 100 {
                milestones.append("100_total_bakes");
            }
            if member_count >= 10 {
                milestones.append("10_members");
            }

            milestones
        }

        fn get_pod_stats(self: @ContractState, pod_id: u32) -> PodStats {
            let pod = self.pods.read(pod_id);
            let total_bakes = self.pod_total_bakes.read(pod_id);
            let member_count = self.pod_member_count.read(pod_id);
            let current_day = self._get_current_day();
            let daily_bakes = self.pod_daily_bakes.read((pod_id, current_day));

            PodStats {
                pod_id,
                total_bakes,
                member_count,
                daily_bakes_today: daily_bakes,
                current_streak: pod.current_streak,
                target_streak: pod.target_streak,
                is_active: pod.is_active,
            }
        }

        fn has_user_baked_today_in_pod(self: @ContractState, pod_id: u32, user: ContractAddress) -> bool {
            let current_day = self._get_current_day();
            self.pod_bakes.read((pod_id, user, current_day))
        }

        fn deactivate_pod(ref self: ContractState, pod_id: u32) {
            let caller = get_caller_address();
            let mut pod = self.pods.read(pod_id);
            
            assert(caller == pod.creator, 'Only creator can deactivate');
            
            pod.is_active = false;
            self.pods.write(pod_id, pod);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _add_member_to_pod(ref self: ContractState, pod_id: u32, user: ContractAddress) {
            // Mark user as member
            self.pod_members.write((pod_id, user), true);

            // Add to member list
            let member_count = self.pod_member_count.read(pod_id);
            self.pod_member_list.write((pod_id, member_count), user);
            self.pod_member_count.write(pod_id, member_count + 1);

            // Add to user's pod list
            let user_pod_count = self.user_pod_count.read(user);
            self.user_pods.write((user, user_pod_count), pod_id);
            self.user_pod_count.write(user, user_pod_count + 1);
        }

        fn _remove_member_from_pod(ref self: ContractState, pod_id: u32, user: ContractAddress) {
            // Remove from member map
            self.pod_members.write((pod_id, user), false);

            // Remove from member list and compact
            let member_count = self.pod_member_count.read(pod_id);
            let mut i = 0;
            let mut found = false;
            while i < member_count {
                if self.pod_member_list.read((pod_id, i)) == user {
                    found = true;
                    break;
                }
                i += 1;
            };

            if found {
                // Shift remaining members
                let mut j = i;
                while j < member_count - 1 {
                    let next_member = self.pod_member_list.read((pod_id, j + 1));
                    self.pod_member_list.write((pod_id, j), next_member);
                    j += 1;
                };
                self.pod_member_count.write(pod_id, member_count - 1);
            }

            // Remove from user's pod list
            let user_pod_count = self.user_pod_count.read(user);
            let mut k = 0;
            let mut found_user_pod = false;
            while k < user_pod_count {
                if self.user_pods.read((user, k)) == pod_id {
                    found_user_pod = true;
                    break;
                }
                k += 1;
            };

            if found_user_pod {
                // Shift remaining pods
                let mut l = k;
                while l < user_pod_count - 1 {
                    let next_pod = self.user_pods.read((user, l + 1));
                    self.user_pods.write((user, l), next_pod);
                    l += 1;
                };
                self.user_pod_count.write(user, user_pod_count - 1);
            }
        }

        fn _get_current_day(self: @ContractState) -> u64 {
            // Convert timestamp to day number (assuming 24-hour days)
            get_block_timestamp() / 86400
        }

        fn _update_pod_streak(ref self: ContractState, pod_id: u32) {
            let current_day = self._get_current_day();
            let mut pod = self.pods.read(pod_id);
            let member_count = self.pod_member_count.read(pod_id);
            let daily_bakes = self.pod_daily_bakes.read((pod_id, current_day));
            let yesterday_bakes = self.pod_daily_bakes.read((pod_id, current_day - 1));

            let old_streak = pod.current_streak;

            // Simple streak logic: if all members baked today, continue/start streak
            if daily_bakes >= member_count {
                if yesterday_bakes >= member_count {
                    pod.current_streak += 1;
                } else {
                    pod.current_streak = 1;
                }
            } else {
                pod.current_streak = 0;
            }

            let new_streak = pod.current_streak;
            self.pods.write(pod_id, pod);

            if old_streak != new_streak {
                self.emit(PodStreakUpdated { pod_id, old_streak, new_streak });
            }
        }
    }
}