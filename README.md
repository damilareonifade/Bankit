# Bankit
# General Knowledge

1. What are the key security considerations when developing financial applications?
Answer: Use robust encryption like AES-256, require multi-factor authentication (MFA), perform regular security checks, and secure API interactions. Prevent SQL injection and CSRF attacks, and ensure data transmission is encrypted with HTTPS.

2. Describe the importance of compliance standards such as PCI-DSS and GDPR in financial applications.
Answer: PCI-DSS ensures secure handling of cardholder data, while GDPR protects user privacy and data rights. 

3. Explain the concept of "idempotency" in financial transactions and why it's crucial.
Answer: Idempotency ensures that repeating a transaction (e.g., due to network issues) doesn’t alter the outcome. It’s crucial to prevent duplicate charges or payments, maintaining transaction integrity.

4. What are the potential risks of handling sensitive customer data, and how can they be mitigated?
Answer:  Risks include data breaches, identity theft, and financial fraud. Mitigate by encrypting sensitive data, implementing role-based access control, and conducting regular employee training on data security best practices.


# SECTION B: BACKEND DEVELOPMENT THEORY
1. Explain the importance of ACID properties in financial applications and how they apply to databases.
Answer: ACID(Atomicity, Consistency, Isolation, Durability) ensures reliable and accurate transactions. Atomicity guarantees all parts of a transaction succeed or fail together, Consistency maintains data integrity, Isolation prevents interference between concurrent transactions, and Durability ensures committed transactions persist even after system failures. These properties are critical for maintaining trust and accuracy in financial systems.

2. What is the role of encryption in securing bank transactions?
Answer:  Role of Encryption: Encryption secures bank transactions by converting sensitive data (e.g., account details, transaction amounts) into unreadable formats during transmission and storage. This prevents unauthorized access, tampering, or interception, ensuring confidentiality and integrity.

3. Describe how you would implement a secure login system using JWT tokens?
Answer: Secure Login with JWT Tokens: Implement a login system where the server generates a JWT (JSON Web Token) upon successful authentication. The token, signed with a secret key, contains user claims (e.g., roles, expiration). Store the token securely (e.g., HTTP-only cookies) and validate it on each request to ensure authenticity and prevent unauthorized access.

4. How would you handle concurrent transactions to prevent double spending or data inconsistencies?
Answer: Handling Concurrent Transactions: Use database locks or optimistic concurrency control to prevent double spending or inconsistencies

# 2. 2. Optimize the following SQL query for a microfinance bank's customer records:
SELECT * FROM transactions WHERE customer_id = '12345' ORDER BY date
DESC;
Answer: By adding limiting the number of result to be giving on the first query we make the application faster and the database query better, and I also ensure we are getting the values we need such as transaction_id,amount,type,date,status.
SELECT transaction_id, amount, type, date 
FROM transactions 
WHERE customer_id = '12345' 
ORDER BY date DESC 
LIMIT 50 OFFSET 0;
