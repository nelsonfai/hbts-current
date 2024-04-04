import AsyncStorageService from "./asyncStorage";
import { API_BASE_URL } from "../appConstants";

const updateTourStatus = async (fieldToUpdate, value) => {
    const data = {
        [fieldToUpdate]: value
    };

    try {
        const token = await AsyncStorageService.getItem("token");
        const apiUrl = `${API_BASE_URL}/update-profile/`;
        const requestOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(data)
        };

        const response = await fetch(apiUrl, requestOptions);

        if (response.ok) {
            console.log(`Tour status ${fieldToUpdate} - value of ${value} updated successfully`);
        } else {
            const errorData = await response.json();
        }
    } catch (error) {
        console.log("Error updating tour status:", error.message);
    }
};

export default updateTourStatus;
