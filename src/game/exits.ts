import type { Room } from './model';
export const exitPoses:Partial<Record<Room,Partial<Record<Room,[number,number,string]>>>>={
 train:{platform:[61,65,'↑']},
 platform:{train:[6,61,'‹'],waiting:[87,52,'↑'],bridge:[23,30,'↑']},
 waiting:{platform:[10,48,'‹'],forecourt:[48,91,'↓'],office:[83,39,'↑']},
 forecourt:{waiting:[23,46,'↑']},
 office:{waiting:[5,72,'‹'],lost:[88,42,'↑'],store:[72,45,'↑']},
 lost:{office:[85,34,'↑']},
 store:{office:[12,36,'↑'],lamp:[72,47,'↑'],tunnel:[94,50,'↑']},
 lamp:{store:[5,62,'‹']},
 bridge:{platform:[12,82,'↓'],closed:[87,33,'↑']},
 tunnel:{store:[6,42,'‹'],closed:[62,47,'↑']},
 closed:{bridge:[68,36,'↑'],tunnel:[92,44,'↑'],return:[83,70,'↑']},
};
