import { useState, ChangeEvent, FormEvent } from 'react';
import { useSignUp } from '@clerk/clerk-react';
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
  firstName: string;
  lastName: string;
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
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">✓</span>
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
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">✨</span>
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
        <span className="text-white font-bold">🚀</span>
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
      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">💎</span>
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
        <span className="text-white font-bold text-sm">⭐</span>
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
      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">💫</span>
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
        <span className="text-white font-bold">🎯</span>
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
      <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">🏆</span>
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
      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">🌟</span>
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

export function ModernSignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const goToSignIn = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLocation('/sign-in');
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
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setLocation('/dashboard');
      } else {
        // Handle email verification if needed
        setError('Please check your email for verification.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = {
    header: 'Create Account',
    subHeader: 'Sign up to get started with our AI Voice Agent',
    fields: [
      {
        label: 'First Name',
        required: true,
        type: 'text' as const,
        placeholder: 'Enter your first name',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'firstName'),
      },
      {
        label: 'Last Name',
        required: true,
        type: 'text' as const,
        placeholder: 'Enter your last name',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'lastName'),
      },
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
        placeholder: 'Create a strong password',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: isLoading ? 'Creating Account...' : 'Create Account',
    textVariantButton: 'Already have an account? Sign in',
    errorField: error,
  };

  return (
    <section className='min-h-screen flex max-lg:justify-center bg-background text-foreground relative'>
      <ThemeToggle />
      
      {/* Left Side - Animated Background */}
      <span className='flex flex-col justify-center w-1/2 max-lg:hidden relative'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} text="Join Us" />
      </span>

      {/* Right Side - Sign Up Form */}
      <span className='w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]'>
        <AuthTabs
          formFields={formFields}
          goTo={goToSignIn}
          handleSubmit={handleSubmit}
        />
      </span>
    </section>
  );
}