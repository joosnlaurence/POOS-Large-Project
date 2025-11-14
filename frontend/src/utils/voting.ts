import * as URL from '../url.ts';

export async function sendVote(fountainId: string, rating: string) {
    const ret = {
        msg: '',
        success: false,
        updatedVote: false,
        filterChanged: false,
        newFilterColor: ''
    }

    try {
        const userDataString = localStorage.getItem('user_data');
        if(!userDataString) {
            ret.msg = "Please log in before voting";
            return ret;
        }

        const userData = JSON.parse(userDataString);
        let accessToken = userData.accessToken;

        if(!accessToken){
            console.error('No access token for voting found');
            ret.msg = "Unauthorized request to vote";
            return ret;
        }

        const isVerified = userData.isVerified;
        if(!isVerified){
            ret.msg = "You must verify your email before you can vote!";
            console.log("You must verify your email before you can vote!");
            return ret;
        }

        // helper function to make requests
        const requestVote = (accessToken: string) => fetch(URL.buildPath('/api/votes/add'), {
            method: "POST",
            credentials: 'include',
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ fountainId, rating })
        });

        let response = await requestVote(accessToken);
        // attempt to refresh access token
        // maybe i could put this in its own function for re-use, but meh
        if(response.status === 403) { 
            const refreshResponse = await fetch(URL.buildPath('/api/users/refresh'), {
                method: "POST",
                credentials: 'include',
            });
            
            // we can't create a new access token
            if(refreshResponse.status !== 201) {
                ret.msg = "Session has expired. Please try logging in again.";
                ret.success = false;
                return ret;
            }
            
            //
            accessToken = (await refreshResponse.json()).accessToken;
            userData.accessToken = accessToken;
            localStorage.setItem('user_data', JSON.stringify(userData));

            response = await requestVote(accessToken);
        }

        const data = await response.json();

        if(response.ok && data.success) {
            ret.updatedVote = data.updatedVote;
            ret.filterChanged = data.filterChanged;
            ret.newFilterColor = data.newFilterColor;
            ret.msg = ret.updatedVote ? "Your vote was updated!" : "New vote added!";
            ret.success = true;
        }
        else {
            console.log(data.error);
            ret.msg = "Error sending vote...";
        }
    }
    catch(err) {
        console.error("Error in sendVote:", err);
        ret.msg = "Network error while sending vote. Please try again."
    }

    return ret;
}