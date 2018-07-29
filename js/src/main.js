import Vue from "../node_modules/vue/dist/vue.esm.browser.js";

const programsAndCommittees = [
    "Labor Standing",
    "Socialists Of Color",
    "Political Education",
    "Communications",
    "Healthcare For All",
    "Direct Service/Brake Lights",
    "Tech",
    "Other",
];

const meetingScheduledResponses = [
    "Meetup Sheduled",
    "Can't / Not Interested",
    "Other",
];

const getAssignedProgramMembers = async () => {
    return await getAssignedProgramMembersFake();
};

const getAssignedProgramMembersFake = async () => {
    const res = await fetch("data/assignedProgramMembers.json");
    const data = await res.json();
    return data;
}

const vm = {
    data:{
        mobilizer: {
            firstName: "Steve",
            lastName: "Price",
        },
        assignedProgramMembers: [],
        selectedProgramMember: null,
        programsAndCommittees,
        meetingScheduledResponses,
    },
    async created() {
        const apm = await getAssignedProgramMembers();
        
        this.assignedProgramMembers = apm;
    }
}

const app = new Vue(vm);
app.$mount("#mobilizer-app");