import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

// 1. OpenAI SVG Logo
export const OpenAILogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-label="OpenAI"
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.686zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.6069 1.4997-2.602-1.4997z" />
  </svg>
);

// 2. Anthropic Claude Geometric Star
export const AnthropicLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-label="Anthropic Claude"
  >
    <path d="M13.824 3.429h2.956L24 20.571h-3.084l-1.92-4.571H9.98l-1.92 4.571H4.976L11.896 3.43h1.928zm1.908 9.771l-2.736-6.514-2.736 6.514h5.472zM3.088 15.6l1.28-3.047L0 12.553z" />
  </svg>
);

// 3. Google Gemini 4-Point Gradient Star
export const GeminiLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => {
  const gradId = React.useId();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="Google Gemini"
    >
      <defs>
        <linearGradient id={`${gradId}-gem`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="35%" stopColor="#9B72CB" />
          <stop offset="70%" stopColor="#D96570" />
          <stop offset="100%" stopColor="#FFA439" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill={`url(#${gradId}-gem)`}
      />
    </svg>
  );
};

// 4. Meta Llama Infinity Loop
export const MetaLlamaLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => {
  const gradId = React.useId();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="Meta Llama"
    >
      <defs>
        <linearGradient id={`${gradId}-meta`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0866FF" />
          <stop offset="100%" stopColor="#00B2FF" />
        </linearGradient>
      </defs>
      <path
        d="M6.86 5C3.62 5 1 7.6 1 10.82c0 4.09 3.54 7.6 7.64 7.6 2.45 0 4.41-1.28 5.36-2.58.95 1.3 2.91 2.58 5.36 2.58 4.1 0 7.64-3.51 7.64-7.6C27 7.6 24.38 5 21.14 5c-2.73 0-4.84 1.63-5.74 3.32-.9-1.69-3.01-3.32-5.74-3.32h-2.8zm0 2.4h.02c1.9 0 3.56 1.44 4.15 3.37l.08.28c.36 1.32 1.38 2.35 2.89 2.35s2.53-1.03 2.89-2.35l.08-.28c.59-1.93 2.25-3.37 4.15-3.37 2.18 0 3.96 1.76 3.96 3.95 0 3.01-2.48 5.34-5.24 5.34-2.07 0-3.69-1.39-4.25-3.18a4.93 4.93 0 0 0-1.63-2.32c-.37-.28-.77-.42-1.18-.42-.41 0-.81.14-1.18.42-.51.39-1.04 1.15-1.63 2.32-.56 1.79-2.18 3.18-4.25 3.18-2.76 0-5.24-2.33-5.24-5.34 0-2.19 1.78-3.95 3.96-3.95z"
        transform="scale(0.88) translate(1.5, 2)"
        fill={`url(#${gradId}-meta)`}
      />
    </svg>
  );
};

// 5. Mistral AI Layered Geometric Pixels
export const MistralLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="Mistral AI"
  >
    <rect x="2" y="2" width="5" height="5" fill="#FA520F" />
    <rect x="17" y="2" width="5" height="5" fill="#FA520F" />
    <rect x="2" y="7" width="5" height="5" fill="#FA520F" />
    <rect x="7" y="7" width="5" height="5" fill="#FA7A1E" />
    <rect x="12" y="7" width="5" height="5" fill="#FA7A1E" />
    <rect x="17" y="7" width="5" height="5" fill="#FA520F" />
    <rect x="2" y="12" width="5" height="5" fill="#FA520F" />
    <rect x="7" y="12" width="5" height="5" fill="#FA7A1E" />
    <rect x="12" y="12" width="5" height="5" fill="#FDB022" />
    <rect x="17" y="12" width="5" height="5" fill="#FA520F" />
    <rect x="2" y="17" width="5" height="5" fill="#FA520F" />
    <rect x="17" y="17" width="5" height="5" fill="#FA520F" />
  </svg>
);

// 6. DeepSeek Marine Fin / Whale Silhouette
export const DeepSeekLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="DeepSeek"
  >
    <path
      d="M3 13.5C3 8.253 7.253 4 12.5 4C17.747 4 22 8.253 22 13.5C22 16.5 20.2 19 17.5 19.5C14.8 20 13.5 17.5 11.5 17.5C9.5 17.5 7.5 19.5 4.5 18C3.5 17.5 3 15.5 3 13.5Z"
      fill="#1E56F0"
    />
    <path
      d="M12.5 4C12.5 4 16 7.5 16 11C16 14.5 12.5 16 12.5 16"
      stroke="#64B5F6"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="7" cy="11.5" r="1.5" fill="#FFFFFF" />
  </svg>
);

// 7. Cohere Coral Geometric Mark
export const CohereLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="Cohere"
  >
    <path
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12"
      stroke="#39594D"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M17 7C19.761 9.761 19.761 14.239 17 17C14.239 19.761 9.761 19.761 7 17"
      stroke="#FF7B54"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

// 8. Groq Speed Lightning Mark
export const GroqLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="Groq"
  >
    <rect width="24" height="24" rx="6" fill="#F55036" />
    <path
      d="M13.5 4L6 13.5H12L10.5 20L18 10.5H12L13.5 4Z"
      fill="white"
    />
  </svg>
);
