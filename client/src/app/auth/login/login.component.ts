import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';

interface ResponseType {
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private api: ApiService,  private router: Router) {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });

  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    const formData = this.loginForm.value;
    if (this.loginForm.valid) {
      this.api.login(formData.username, formData.password)
        .subscribe(response => {
          this.isLoading = false;
          localStorage.setItem('token', (response as ResponseType).token);
          this.router.navigate(['/mongo-client']);
        }, error => {
          this.isLoading = false;
          this.errorMessage = 'Authentication failed. Please check your credentials and try again.';
        });
    } else {
        this.loginForm.markAllAsTouched();
    }
  }
}
