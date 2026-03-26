import {Box} from "lucide-react"
import Button from "../ui/Button";
import {useOutletContext} from "react-router";
import type {AuthContext} from "../type";

const Navbar = () => {
   const {isSignedIn, userName, signIn, signOut} = useOutletContext<AuthContext>()
    const handleAuthClick = async () =>{
       if(isSignedIn){
           try {
               await signOut();
           }catch (e) {
               console.error(`puter signIn error: ${e}`);
           }
           return;
       }

       try {
           await signIn();
       }catch (e) {
           console.error(`puter signIn error: ${e}`);
       }
    }
    return (
        <header className='navbar'>
            <nav className="inner">
                <div className='left'>
                    <div className='brand'>
                        <Box className='logo'/>
                        <span className="name"> Roomify</span>
                    </div>
                    <ul className='links'>
                        <a href="#">Product</a>
                        <a href="#">Pricing</a>
                        <a href="#">Community</a>
                        <a href="#">Enterprise</a>
                    </ul>
                </div>
                <div className="actions">
                    {isSignedIn ? (
                       <>
                       <span>
                           {userName ?`Hi,${userName}` :`Signed in`}
                       </span>
                           <Button size='sm' onClick={handleAuthClick} className='Login'>Log Out</Button>
                       </>
                    ):(
                        <>
                            <Button onClick={handleAuthClick}
                                    className="login"
                            > Log In</Button>
                            <a href="#" className="cta"> Get Started</a>
                        </>
                    )}
                </div>

            </nav>
        </header>
    )
}

export default Navbar;