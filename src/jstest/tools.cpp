//
// Created by raymond on 5/11/23.
//
#include "User.h"

typedef struct KeySet{
    mpz_t p;
    mpz_t K;
    mpz_t s;
}KeySet;

KeySet KeySetInit(int lambda) {
    KeySet key;
    mpz_init(key.p);
    mpz_init(key.K);
    mpz_init(key.s);
    clock_t time = clock();
    gmp_randstate_t grt;
    gmp_randinit_mt(grt);
    gmp_randseed_ui(grt, time);
    mpz_urandomb(key.p, grt, lambda);
    mpz_nextprime(key.p, key.p);
    mpz_random(key.K, key.p->_mp_size);
    mpz_mod(key.K, key.K, key.p);
    mpz_random(key.s, key.p->_mp_size);
    mpz_mod(key.s, key.s, key.p);
    gmp_printf("p:%Zd\n", key.p);
    gmp_printf("K:%Zd\n", key.K);
    gmp_printf("s:%Zd\n", key.s);
    return key;
}
KeySet key = KeySetInit(128);
void trans(mpz_t &result, unsigned char data[], int length) {
    mpz_set_ui(result, 0);
    for(int i = 0;i < length; i++) {
        unsigned long da = (unsigned int)data[i];
        mpz_add_ui(result, result, da);
        mpz_mul_ui(result, result, 256);
    }
    mpz_mod(result, result, key.p);
}
void transHash(mpz_t &result, unsigned char data[], int length) {
    mpz_set_ui(result, 0);
    for(int i = 0;i < length; i++) {
        unsigned long da = (unsigned int)data[i];
        mpz_add_ui(result, result, da);
        mpz_mul_ui(result, result, 256);
    }
}
Cytxt EncryptLinearHash(long m) {
    Cytxt result;
    CytxtInit(result);
    AES_KEY encrypt_key;
    char keyK[16];
    gmp_sprintf(keyK, "%Zd", key.K);
    //printf("enkeyK:%s\n", keyK);
    mpz_t kk, rr, plain;
    mpz_init(kk);
    mpz_init(rr);
    mpz_init(plain);

    AES_set_encrypt_key(reinterpret_cast<const unsigned char *>(keyK), 128, &encrypt_key);
    unsigned char r[17], k[17];
    string str = to_string(m);
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(str, hash, SHA256_DIGEST_LENGTH);
    unsigned char *nameR = (unsigned char *)malloc(60);
    unsigned char *nameK = (unsigned char *)malloc(60);
    memset(nameK, 0, 60);
    mpz_t deb;
    mpz_init(deb);
    //memccpy(nameK, hash + 16, 0, 16);
    strncpy(reinterpret_cast<char *>(nameK), reinterpret_cast<const char *>(hash + 16), 16);
    nameK[15] = '2';
    AES_ecb_encrypt(nameK, k, &encrypt_key, AES_ENCRYPT);
    trans(kk,k, 16);
    mpz_set_si(plain, m);
    //gmp_printf("m:  %ld--kk:%Zd\n", m, kk);

    strncpy(reinterpret_cast<char *>(nameR), reinterpret_cast<const char *>(hash + 16), 16);
    nameR[16] = '1';
    //printf("name:%s\n", name);


    transHash(deb,nameR, 17);
    //gmp_printf("deb:%Zd\n", deb);
    AES_ecb_encrypt(nameR, r, &encrypt_key, AES_ENCRYPT);
    //printf("name:%s\n",name);
    trans(rr,r, 17);
    //gmp_printf("m:  %ld--rr:%Zd\n", m, rr);
    //HexCode(k, 16);


    mpz_sub(result.y0, plain, kk);
    //gmp_printf("m-kk:%Zd\n", result.y0);
    mpz_mod(result.y0, result.y0, key.p);
    //gmp_printf("m-kk:%Zd\n", result.y0);
    mpz_sub(result.Y1, rr, result.y0);
    mpz_mod(result.Y1, result.Y1, key.p);

    mpz_t t1, t2;
    mpz_init(t1);
    mpz_init(t2);

    mpz_invert(t1, key.s, key.p);
    mpz_mul(result.Y1, result.Y1, t1);
    //mpz_div(result.Y1, result.Y1, vk.s);
    mpz_mod(result.Y1, result.Y1, key.p);

    //gmp_printf("rr:%Zd\n", rr);
    //gmp_printf("y1:%Zd\n", result.Y1);
    mpz_clear(kk);
    mpz_clear(rr);

    return result;
}

Ctxt Encrypt(long m) {
    Cytxt result;
    CytxtInit(result);
    result = EncryptLinearHash(m);
    Ctxt c;
    char str[50];
    mpz_get_str(str, 10, result.y0);
    string s1(str);
    c.y0 = s1;
    mpz_get_str(str, 10, result.Y1);
    string s2(str);
    c.Y1 = s2;
    return c;
}

void computeK(mpz_t &result, vector<unsigned char *>list, vector<int> coe) {
    AES_KEY encrypt_key;
    char keyK[16];
    gmp_sprintf(keyK, "%Zd", key.K);
    //printf("dekeyK:%s\n", keyK);
    AES_set_encrypt_key(reinterpret_cast<const unsigned char *>(keyK), 128, &encrypt_key);
    mpz_t kL[MAX];

    unsigned char *nameK = (unsigned char *)malloc(60);
    unsigned char k[17];
    mpz_t deb;
    mpz_init(deb);
    //memccpy(nameR, list[0] + 16, 0, 16);
    //printf("nameR:%d\n", strlen(reinterpret_cast<const char *>(nameR)));

    for(int i = 0; i < list.size(); i++) {
        strncpy(reinterpret_cast<char *>(nameK), reinterpret_cast<const char *>(list[i] + 16), 16);
        nameK[15] = '2';
        transHash(deb,nameK, 17);
        gmp_printf("deb:%Zd\n", deb);
        AES_ecb_encrypt(nameK, k, &encrypt_key, AES_ENCRYPT);
        //HexCode(r, 16);
        mpz_init(kL[i]);
        trans(kL[i], k, 16);
        gmp_printf("i:%d k:%Zd\n", i, kL[i]);
    }
    //gmp_printf("kl1: %Zd\n", kL[1]);
    //然后计算一下k
    mpz_t temp;
    mpz_init(temp);
    mpz_init(result);
    mpz_init_set_ui(result, 0);
    for(int i = 0; i < coe.size(); i++) {
        mpz_init_set_ui(temp, coe[i]);
        mpz_mul(temp, kL[i], temp);
        mpz_mod(temp, temp, key.p);
        mpz_add(result, result, temp);
        mpz_mod(result, result, key.p);
    }
}
void computeR(mpz_t &result, vector<unsigned char *>list, vector<int> coe) {
    AES_KEY encrypt_key;
    char keyK[16];
    gmp_sprintf(keyK, "%Zd", key.K);
    //printf("dekeyK:%s\n", keyK);
    AES_set_encrypt_key(reinterpret_cast<const unsigned char *>(keyK), 128, &encrypt_key);
    mpz_t rL[MAX];

    unsigned char *nameR = (unsigned char *)malloc(60);
    unsigned char r[17];
    mpz_t deb;
    mpz_init(deb);
    //memccpy(nameR, list[0] + 16, 0, 16);
    //printf("nameR:%d\n", strlen(reinterpret_cast<const char *>(nameR)));

    for(int i = 0; i < list.size(); i++) {
        strncpy(reinterpret_cast<char *>(nameR), reinterpret_cast<const char *>(list[i] + 16), 16);
        nameR[16] = '1';
        transHash(deb,nameR, 17);
        //gmp_printf("deb:%Zd\n", deb);
        AES_ecb_encrypt(nameR, r, &encrypt_key, AES_ENCRYPT);
        //HexCode(r, 16);
        mpz_init(rL[i]);
        trans(rL[i], r, 17);
        //gmp_printf("i:%d r:%Zd\n", i, rL[i]);

    }
    //gmp_printf("kl1: %Zd\n", kL[1]);
    //然后计算一下r
    mpz_t temp;
    mpz_init(temp);
    mpz_init(result);
    mpz_init_set_ui(result, 0);
    for(int i = 0; i < coe.size(); i++) {
        mpz_init_set_ui(temp, coe[i]);
        mpz_mul(temp, rL[i], temp);
        mpz_mod(temp, temp, key.p);
        mpz_add(result, result, temp);
        mpz_mod(result, result, key.p);
    }
}
float DecryptLinearHash(Cytxt c, vector<unsigned char *>list, vector<int> coe) {

    //计算一下k
    mpz_t result;
    mpz_init(result);
    computeK(result, list, coe);

    mpz_add(result, c.y0, result);
    mpz_mod(result, result, key.p);
    long mes;
    mes = mpz_get_si(result);
    float ret = longToFloat(mes, 20);
    return ret;
}

bool verify(vector<unsigned char *>list, vector<int> coe, Cytxt c) {
    mpz_t temp, r_result;
    mpz_init(temp);
    mpz_init(r_result);
    computeR(r_result, list, coe);
    mpz_mul(temp, c.Y1, key.s);
    mpz_add(temp, c.y0, temp);
    mpz_mod(temp, temp, key.p);
    if(mpz_cmp(temp, r_result) == 0) {
        printf("verify pass\n");
        return true;
    }else {
        printf("verify fail\n");
        return false;
    }
}