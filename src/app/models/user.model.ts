export interface User {
     user_id: string;
     first_name: string;
     last_name: string;
     email: string;
     phone_number: string;
     user_type: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
     profile_image_url?: string;
     is_verified: boolean;
   }
     