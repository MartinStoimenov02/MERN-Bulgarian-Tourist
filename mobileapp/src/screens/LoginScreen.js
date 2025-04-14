import React, { useState } from "react";
import { 
    View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet, Modal 
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const host = process.env.HOST;
const port = process.env.PORT;

const LoginScreen = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const navigation = useNavigation();

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        try {
            const res = await axios.post("http://192.168.0.7:3001/users/getUser", formData);
            if (res.data.success) {
                setIsAuthenticated(true);
                Alert.alert("Success", "Login Successful!");
                navigation.navigate("HomeScreen");
            } else {
                setMessage(res.data.message);
                setSuccess(false);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Login failed");
            setSuccess(false);
        }
    };

    const handleForgotPassword = async () => {
        try {
            const userCheck = await axios.post("http://"+host+":"+port+"/users/checkUserExists", {
                email: formData.email
            });

            if (!userCheck.data.exists) {
                Alert.alert("Error", "Email not found.");
                return;
            }

            await axios.post("http://"+host+":"+port+"/email/sendVerificationCode", {
                email: formData.email
            });

            setShowModal(true);
        } catch (error) {
            Alert.alert("Error", "Failed to send verification code.");
        }
    };

    const handleVerifyCode = async () => {
        try {
            const res = await axios.post("http://"+host+":"+port+"/email/verifyCode", {
                email: formData.email,
                code: verificationCode
            });

            if (res.data.success) {
                navigation.navigate("ForgotPasswordScreen", { email: formData.email });
            } else {
                Alert.alert("Error", "Invalid verification code.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to verify code.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(text) => handleChange("password", text)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Text>{showPassword ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
            </View>
            <Button title="Login" onPress={handleSubmit} />
            <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>

            {message ? <Text style={success ? styles.success : styles.error}>{message}</Text> : null}

            <Modal visible={showModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text>Enter Verification Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Code"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                    />
                    <Button title="Verify" onPress={handleVerifyCode} />
                    <Button title="Close" onPress={() => setShowModal(false)} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    eyeIcon: {
        marginLeft: 10,
    },
    link: {
        marginTop: 10,
        color: "blue",
    },
    success: {
        color: "green",
        marginTop: 10,
    },
    error: {
        color: "red",
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default LoginScreen;
