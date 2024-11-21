import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
@Injectable({
	providedIn: 'root',
})
export class SubscriptionGuard implements CanActivate {
	constructor(private authService: AuthenticationService, private userService: UserService, private router: Router) {}

	canActivate(): Observable<boolean> | Promise<boolean> | boolean {
		return true;
		if (this.authService.isAuthenticated()) {
			return this.userService
				.getUserMembership()
				.then((res) => {
					console.log(res);
					let membership = res?.data;
					if (!membership.isCancelled) {
						return true;
					} else {
						this.router.navigate(['/billing']);
						return false;
					}
				})
				.catch(() => {
					this.router.navigate(['/billing']);
					return false;
				});
		} else {
			this.router.navigate(['/login']);
			return false;
		}
	}
}
