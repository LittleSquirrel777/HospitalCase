//
// Created by raymond on 5/11/23.
//
#include "User.h"

typedef struct KeySet{
    mpz_t p;
    mpz_t K;
    mpz_t s;
}KeySet;

extern "C" {
    void trans(mpz_t &result, unsigned char data[], int length);
    void transHash(mpz_t &result, unsigned char data[], int length);
    void HexCode(unsigned char* data, int len);
    Cyt EncryptLinearHash(long m);
    Cyt EncryptLinearHashK(long m, char *keyAddress, char *name);
    char* EncryptLinear(long m);
    char* EncryptLinearK(float m, char *keyAddress, char *name);
    void computeSingleK(long m, char* k);
    void computeK(mpz_t &result, vector<unsigned char *>list, vector<int> coe);
    void computeR(mpz_t &result, vector<unsigned char *>list, vector<int> coe);
    float DecryptLinearHash(Cyt c, vector<unsigned char *>list, vector<int> coe);
    KeySet KeyGenerate(int lambda, char *keyAdd);
    float DecryptLinear(char*, vector<unsigned char *>list, vector<int> coe);
    float Decrypt(char *s, char* k);
    float Decryptinfo(char *s, char *name, char *keyAddress);
    bool verify(vector<unsigned char *>list, vector<int> coe, Cyt c);
    bool verifys(vector<unsigned char *>list, vector<int> coe, char *s);
    vector<vector<Cyt>> batchEncrypt(vector<vector<float>> input);
    //vector<vector<Cyt>> batchEncrypt(vector<vector<double>> input);
    vector<float> batchDecrypt(vector<Cyt> c, vector<vector<unsigned char *>>list, vector<vector<int>> coe);
}


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

KeySet KeyGenerate(int lambda, char *keyAdd) {
    KeySet key = KeySetInit(lambda);
    //char *strKey = (char *)malloc(sizeof(char)*100);
    mpz_get_str(keyAdd, 10, key.K);
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

void HexCode(unsigned char* data, int len) {
    int i = 0;
    for(; i < len; i++) {
        printf("%02x", (unsigned int) data[i]);
    }
    printf("\n");
}
Cyt EncryptLinearHash(long m) {
    Cyt result;
    CytInit(result);
    AES_KEY encrypt_key;
    char keyK[50];
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
    nameR[15] = '1';
    //printf("name:%s\n", name);


    //transHash(deb,nameR, 17);
    //gmp_printf("deb:%Zd\n", deb);
    AES_ecb_encrypt(nameR, r, &encrypt_key, AES_ENCRYPT);
    //printf("name:%s\n",name);
    trans(rr,r, 16);
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
Cyt EncryptLinearHashK(long m, char *keyAddress, char *name) {
    Cyt result;
    CytInit(result);
    AES_KEY encrypt_key;
    char keyK[50];
//    gmp_sprintf(keyK, "%Zd", key.K);
    //printf("enkeyK:%s\n", keyK);
    strcpy(keyK, keyAddress);
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
    strcpy(name, reinterpret_cast<const char *>(nameK));
    trans(kk,k, 16);
    mpz_set_si(plain, m);
    //gmp_printf("m:  %ld--kk:%Zd\n", m, kk);

    strncpy(reinterpret_cast<char *>(nameR), reinterpret_cast<const char *>(hash + 16), 16);
    nameR[15] = '1';
    //printf("name:%s\n", name);
    transHash(deb,nameR, 17);
    //gmp_printf("deb:%Zd\n", deb);
    AES_ecb_encrypt(nameR, r, &encrypt_key, AES_ENCRYPT);
    //printf("name:%s\n",name);
    trans(rr,r, 16);
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
char* EncryptLinear(float m) {
    Cyt result;
    CytInit(result);
    long ml = floatToLong(m, 20);
    result = EncryptLinearHash(ml);
    Ct c;
    char str[50];
    char *stri = (char *)malloc(sizeof(char)*100);
    mpz_get_str(stri, 10, result.y0);
    string s1(str);
    c.y0 = s1;
    mpz_get_str(str, 10, result.Y1);
    string s2(str);
    c.Y1 = s2;
    string ss = s1;
    ss += "s";
    ss += s2;
    strcat(stri, "s");
    strcat(stri, str);
    return stri;
}
char* EncryptLinearK(float m, char *keyAddress, char *name) {
    Cyt result;
    CytInit(result);
    long ml = floatToLong(m, 20);
    result = EncryptLinearHashK(ml, keyAddress, name);
    Ct c;
    char str[50];
    char *stri = (char *)malloc(sizeof(char)*100);
    mpz_get_str(stri, 10, result.y0);
    string s1(str);
    c.y0 = s1;
    mpz_get_str(str, 10, result.Y1);
    string s2(str);
    c.Y1 = s2;
    string ss = s1;
    ss += "s";
    ss += s2;
    strcat(stri, "s");
    strcat(stri, str);
    return stri;
}
void computeSingleK(long m, char* k) {
    Cyt result;
    CytInit(result);
    AES_KEY encrypt_key;
    char keyK[50];
    gmp_sprintf(keyK, "%Zd", key.K);
    //printf("enkeyK:%s\n", keyK);

    AES_set_encrypt_key(reinterpret_cast<const unsigned char *>(keyK), 128, &encrypt_key);
    string str = to_string(m);
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(str, hash, SHA256_DIGEST_LENGTH);
    unsigned char *nameK = (unsigned char *)malloc(16);
    memset(nameK, 0, 16);
    //memccpy(nameK, hash + 16, 0, 16);
    strncpy(reinterpret_cast<char *>(nameK), reinterpret_cast<const char *>(hash + 16), 16);
    nameK[15] = '2';
    printf("before:\n");
    HexCode(reinterpret_cast<unsigned char *>(k), 16);
    AES_ecb_encrypt(nameK, reinterpret_cast<unsigned char *>(k), &encrypt_key, AES_ENCRYPT);
    //printf("%s\n", k);
    printf("after encrypt:\n");
    HexCode(reinterpret_cast<unsigned char *>(k), 16);
    //return k;
}

float Decryptinfo(char *s, char *name, char *keyAddress) {
    AES_KEY encrypt_key;
    char keyK[50];
    strcpy(keyK, keyAddress);
    AES_set_encrypt_key(reinterpret_cast<const unsigned char *>(keyK), 128, &encrypt_key);
    char k[17];
    AES_ecb_encrypt(reinterpret_cast<const unsigned char *>(name), reinterpret_cast<unsigned char *>(k), &encrypt_key, AES_ENCRYPT);
    mpz_t kl;
    mpz_init(kl);
    trans(kl, reinterpret_cast<unsigned char *>(k), 16);
    char *str1 = strtok(s, "s");
    char *str2 = strtok(NULL, "s");
    printf("str1:%s\n", str1);
    printf("str2:%s\n", str2);
    //string str1 = s.substr(0, s.find_first_of('s'));
    //string str2 = s.substr(s.find_first_of('s') + 1);
    Cyt cytxt;
    CytInit(cytxt);
    const char *ch1 = str1;
    const char *ch2 = str2;
    mpz_set_str(cytxt.y0, ch1, 10);
    mpz_set_str(cytxt.Y1, ch2, 10);
    mpz_add(kl, cytxt.y0, kl);
    mpz_mod(kl, kl, key.p);
    long mes;
    mes = mpz_get_si(kl);
    float ret = longToFloat(mes, 20);
    printf("%f\n", ret);
    return ret;
}
void computeK(mpz_t &result, vector<unsigned char *>list, vector<int> coe) {
    AES_KEY encrypt_key;
    char keyK[50];
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
    char keyK[50];
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
        nameR[15] = '1';
        transHash(deb,nameR, 17);
        //gmp_printf("deb:%Zd\n", deb);
        AES_ecb_encrypt(nameR, r, &encrypt_key, AES_ENCRYPT);
        //HexCode(r, 16);
        mpz_init(rL[i]);
        trans(rL[i], r, 16);
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
float DecryptLinearHash(Cyt c, vector<unsigned char *>list, vector<int> coe) {

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
float Decrypt(char *s, char* k, char *keyAddress) {
    printf("124\n");
    mpz_t kl;
    mpz_init(kl);
    printf("decrypt:\n");
    HexCode(reinterpret_cast<unsigned char *>(k), 16);
    trans(kl, reinterpret_cast<unsigned char *>(k), 16);
    char *str1 = strtok(s, "s");
    char *str2 = strtok(NULL, "s");
    printf("str1:%s\n", str1);
    printf("str2:%s\n", str2);
    //string str1 = s.substr(0, s.find_first_of('s'));
    //string str2 = s.substr(s.find_first_of('s') + 1);
    Cyt cytxt;
    CytInit(cytxt);
    const char *ch1 = str1;
    const char *ch2 = str2;
    mpz_set_str(cytxt.y0, ch1, 10);
    mpz_set_str(cytxt.Y1, ch2, 10);
    mpz_add(kl, cytxt.y0, kl);
    mpz_mod(kl, kl, key.p);
    long mes;
    mes = mpz_get_si(kl);
    printf("%ld\n", mes);
    float ret = longToFloat(mes, 20);
    return ret;
}
float DecryptLinear(char *s, vector<unsigned char *>list, vector<int> coe) {
    char *str1 = strtok(s, "s");
    char *str2 = strtok(NULL, "s");
    //string str1 = s.substr(0, s.find_first_of('s'));
    //string str2 = s.substr(s.find_first_of('s') + 1);
    Cyt cytxt;
    CytInit(cytxt);
    const char *ch1 = str1;
    const char *ch2 = str2;
    mpz_set_str(cytxt.y0, ch1, 10);
    mpz_set_str(cytxt.Y1, ch2, 10);
    return DecryptLinearHash(cytxt, list, coe);
}
bool verify(vector<unsigned char *>list, vector<int> coe, Cyt c) {
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
bool verifys(vector<unsigned char *>list, vector<int> coe, char *s) {
    mpz_t temp, r_result;
    mpz_init(temp);
    mpz_init(r_result);
    computeR(r_result, list, coe);
    char *str1 = strtok(s, "s");
    char *str2 = strtok(NULL, "s");
    printf("str1:%s\n", str1);
    printf("str2:%s\n", str2);
    //string str1 = s.substr(0, s.find_first_of('s'));
    //string str2 = s.substr(s.find_first_of('s') + 1);
    Cyt cytxt;
    CytInit(cytxt);
    const char *ch1 = str1;
    const char *ch2 = str2;
    mpz_set_str(cytxt.y0, ch1, 10);
    mpz_set_str(cytxt.Y1, ch2, 10);
    mpz_mul(temp, cytxt.Y1, key.s);
    mpz_add(temp, cytxt.y0, temp);
    mpz_mod(temp, temp, key.p);
    if(mpz_cmp(temp, r_result) == 0) {
        printf("verify pass\n");
        return true;
    }else {
        printf("verify fail\n");
        return false;
    }
}
vector<vector<Cyt>> batchEncrypt(vector<vector<float>> input) {
    vector<vector<Cyt>> result;
    for(int i = 0; i < input.size(); i++) {
        vector<Cyt> output;
        for(int j = 0; j < input[i].size(); j++) {
            output.push_back(EncryptLinearHash(floatToLong(input[i][j], 20)));
        }
        result.push_back(output);
    }
    return result;
}

vector<vector<Cyt>> batchEncrypt(vector<vector<double>> input) {
    vector<vector<Cyt>> result;
    for(int i = 0; i < input.size(); i++) {
        vector<Cyt> output;
        for(int j = 0; j < input[i].size(); j++) {
            output.push_back(EncryptLinearHash(doubleToLong(input[i][j], 20)));
        }
        result.push_back(output);
    }
    return result;
}

vector<float> batchDecrypt(vector<Cyt> c, vector<vector<unsigned char *>>list, vector<vector<int>> coe) {
    vector<float> output;
    float a;
    for(int i = 0; i < c.size(); i++) {
        unsigned char hash[SHA256_DIGEST_LENGTH];
        a = DecryptLinearHash(c[i], list[i], coe[i]);
        output.push_back(a);
    }
    return output;
}


int main() {
    char *keyK = (char*)malloc(50);
    KeySet key = KeyGenerate(128, keyK);
    char name[16];
    char* s = EncryptLinearK(0.6923, keyK, name);
    printf("%s\n", s);
    //string str1 = s.substr(0, s.find_first_of('s'));
    //string str2 = s.substr(s.find_first_of('s') + 1);
    char *k = (char*)malloc(sizeof(char)*30);
    //printf("%s\n", k);
    HexCode(reinterpret_cast<unsigned char *>(k), 16);
    Decryptinfo(s, name, keyK);
//    char *keyAddress = (char *)malloc(sizeof(char) * 100);
//    KeySet key = KeyGenerate(128, keyAddress);
//    //char keyK[50];
//
//    char keyK[16];
//    //gmp_sprintf(keyK, "%Zd", key.K);
//    printf("enkeyK:%s\n", keyK);
//
//    printf("%s\n", keyAddress);
//    strcpy(keyK, keyAddress);
//    printf("%s\n", keyK);
    return 0;
}