import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

const API_SIGNUP_URL = 'http://localhost:9090/api/auth/signup';

const Signup = () => {
    // Hooks
    const navigate = useNavigate();

    // State for required fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    // API status
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Handles file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProfileImage(e.target.files[0]);
        } else {
            setProfileImage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true); // ⬅️ DISABLE BUTTON

        // 1. Frontend Validation
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match!" });
            setLoading(false);
            return;
        }
        if (!profileImage) {
            setMessage({ type: 'error', text: "Please select a profile image." });
            setLoading(false);
            return;
        }

        // 2. Create FormData payload
        const formPayload = new FormData();
        formPayload.append('firstName', firstName);
        formPayload.append('lastName', lastName);
        formPayload.append('birthDate', birthDate);
        formPayload.append('email', email);
        formPayload.append('password', password);
        formPayload.append('profileImage', profileImage);

        // 3. API Call
        try {
            const response = await fetch(API_SIGNUP_URL, {
                method: 'POST',
                body: formPayload, 
            });

            if (response.ok) {
                // SUCCESS: Show message and redirect
                const data = await response.json();
                setMessage({ type: 'success', text: `Registration successful for ${data.firstName}! Redirecting to login... 🚀` });
                
                // Clear fields
                setFirstName(""); setLastName(""); setBirthDate(""); setEmail(""); setPassword(""); setConfirmPassword(""); setProfileImage(null);
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000); 
                
                // We keep loading=true until redirection to prevent user interaction
                
            } else {
                // SERVER ERROR (e.g., Email already used)
                const errorText = await response.text();
                setMessage({ type: 'error', text: `Registration failed: ${errorText || response.statusText}` });
                setLoading(false); // ⬅️ RE-ENABLE BUTTON
            }

        } catch (error) {
            // NETWORK/FETCH ERROR
            console.error('Network/fetch error:', error);
            setMessage({ type: 'error', text: "Network error or server unreachable (CORS/9090). 💔" });
            setLoading(false); // ⬅️ RE-ENABLE BUTTON
        }
    };

    // Render component (Style conserved, text translated)
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden circuit-lines">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-2xl bg-primary/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="gradient-card rounded-2xl border border-primary/20 p-8 shadow-[0_0_60px_hsla(189,100%,50%,0.15)]">
            <div className="text-center mb-6">
              <Link to="/" className="inline-block">
                <div className="text-4xl font-bold mb-2">
                  <span className="text-foreground">My</span>
                  <span className="text-primary glow-text">LB</span>
                </div>
              </Link>
              <p className="text-muted-foreground text-sm">Create your account</p>
            </div>

            {/* API Message Display */}
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Last Name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div>
                  <Label>First Name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
              </div>

                <div>
                <Label>Date of Birth</Label>
                <Input 
                    type="date" 
                    value={birthDate} 
                    onChange={(e)=>setBirthDate(e.target.value)} 
                    required 
                    max={new Date().toISOString().split("T")[0]} 
                />
                </div>

                {/* Profile Image Upload Field */}
                <div>
                    <Label htmlFor="profile-image">Profile Image</Label>
                    <Input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file:text-sm file:font-semibold file:bg-primary/10 file:text-primary file:border-0 hover:file:bg-primary/20"
                        required
                    />
                    {profileImage && <p className="text-xs text-muted-foreground mt-1">File selected: {profileImage.name}</p>}
                </div>
                
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div>
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 glow-border transition-all duration-300 hover:shadow-[0_0_50px_hsla(189,100%,50%,0.5)]"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>

            <p className="text-center text-sm mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary glow-text hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
};

export default Signup;