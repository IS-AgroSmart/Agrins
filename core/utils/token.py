from django.contrib.auth.tokens import PasswordResetTokenGenerator 
#from django.utils import six 


class TokenGenerator(PasswordResetTokenGenerator): 
    def _make_hash_value(self, user, timestamp): 
        return ( 
            str(user.is_active) + str(user.pk) + str(timestamp) 
        ) 
account_activation_token = TokenGenerator()