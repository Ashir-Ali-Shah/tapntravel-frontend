import { FaBus } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

function Signup() {
  return (
    <div className="px-4 lg:px-0 grid grid-cols-1 md:grid-cols-2 overflow-hidden h-screen bg-main bg-[url('https://images.pexels.com/photos/4502111/pexels-photo-4502111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] lg:bg-none">
      <div className="hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1543859184-17ac017dde53?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="object-cover w-full h-full"
          alt="signup-illustration"
        />
      </div>

      <div className="flex justify-center max-h-screen">
        <form className="border-primary border-solid border-2 w-full lg:w-2/3 rounded-lg h-fit my-auto px-4 lg:px-10 py-5">
          <div className="flex items-center justify-center">
            <FaBus className="text-2xl text-primary mr-2" />
            <span className="text-primary text-2xl text-center font-bold mb-0.5">
            Tap & Travel
            </span>
          </div>
          <h2 className="text-xl italic font-bold text-center mb-0.5">
          Journey Bright, Day or Night
          </h2>

          <div className="max-w-fit flex space-x-2">
            <div className="w-1/2 mb-1 flex flex-col">
              <label htmlFor="first-name" className="font-bold text-lg">
                First Name :
              </label>
              <input
                type="text"
                placeholder="First Name"
                id="first-name"
                className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
                name="first-name"
              />
            </div>
            <div className="w-1/2 mb-1 flex flex-col">
              <label htmlFor="last-name" className="font-bold text-lg">
                Last Name :
              </label>
              <input
                className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
                type="text"
                placeholder="Last Name"
                id="last-name"
                name="last-name"
              />
            </div>
          </div>

          <div className="mb-1 flex flex-col">
            <label htmlFor="email" className="font-bold text-lg">
              Email :
            </label>
            <input
              className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter Your E-mail"
            />
          </div>

          <div className="mb-1 flex flex-col">
            <label htmlFor="password" className="font-bold text-lg">
              Password :
            </label>
            <input
              className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
              type="password"
              id="password"
              name="password"
              placeholder="Enter Password"
              required
            />
          </div>

          <div className="mb-1 flex flex-col">
            <label htmlFor="confirm-password" className="font-bold text-lg">
              Confirm Password :
            </label>
            <input
              className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
              type="password"
              name="confirm-password"
              id="confirm-password"
              placeholder="Confirm Password"
            />
          </div>

          <div>
            <div className="bg-primary my-2 border-2 border-solid rounded-full px-4 py-1 text-main text-xl w-full">
              <button className="text-main text-lg w-full" type="submit">
                Sign Up
              </button>
            </div>
            <h3 className="text-lg text-center">
              Already have an account, go to <br className="block md:hidden" />
              <NavLink to="/login" className=" font-bold underline italic">
                Login Page
              </NavLink>
            </h3>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
