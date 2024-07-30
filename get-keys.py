from secrets import token_hex

print(f'ENCRYPTION KEY:\n{token_hex(32)}')
print(f'HMAC KEY:\n{token_hex(32)}')