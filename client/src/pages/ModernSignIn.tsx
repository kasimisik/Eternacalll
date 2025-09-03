import { useState, ChangeEvent, FormEvent } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
  type Field,
} from '@/components/ui/modern-animated-sign-in';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type FormData = {
  email: string;
  password: string;
};

interface OrbitIcon {
  component: () => React.ReactNode;
  className: string;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
}

const iconsArray: OrbitIcon[] = [
  {
    component: () => (
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">R</span>
      </div>
    ),
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">T</span>
      </div>
    ),
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">JS</span>
      </div>
    ),
    className: 'size-[50px] border-none bg-transparent',
    radius: 210,
    duration: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">TS</span>
      </div>
    ),
    className: 'size-[50px] border-none bg-transparent',
    radius: 210,
    duration: 20,
    delay: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">C</span>
      </div>
    ),
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">N</span>
      </div>
    ),
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">RX</span>
      </div>
    ),
    className: 'size-[50px] border-none bg-transparent',
    radius: 270,
    duration: 20,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">FG</span>
      </div>
    ),
    className: 'size-[50px] border-none bg-transparent',
    radius: 270,
    duration: 20,
    delay: 60,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">GT</span>
      </div>
    ),
    className: 'size-[50px] border-none bg-transparent',
    radius: 320,
    duration: 20,
    delay: 20,
    path: false,
    reverse: false,
  },
];

export function ModernSignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const goToSignUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLocation('/sign-up');
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    name: keyof FormData
  ) => {
    const value = event.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setLocation('/dashboard');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Google sign in failed');
      setIsLoading(false);
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your account to continue',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'Enter your email address',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: 'Enter your password',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: isLoading ? 'Signing in...' : 'Sign in',
    textVariantButton: "Don't have an account? Sign up",
    errorField: error,
  };

  return (
    <section className='min-h-screen flex max-lg:justify-center bg-background text-foreground relative'>
      <ThemeToggle />
      
      {/* Left Side - Animated Background */}
      <span className='flex flex-col justify-center w-1/2 max-lg:hidden relative'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} text="Welcome Back" />
      </span>

      {/* Right Side - Sign In Form */}
      <span className='w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]'>
        <AuthTabs
          formFields={formFields}
          goTo={goToSignUp}
          handleSubmit={handleSubmit}
          onGoogleClick={handleGoogleSignIn}
        />
      </span>
    </section>
  );
}