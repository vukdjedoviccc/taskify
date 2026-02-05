import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { User, PaginatedResponse } from '../models';
import { tap, catchError } from 'rxjs';

type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UserWithCount extends User {
  _count?: { orders: number };
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(ApiService);

  private _items = signal<UserWithCount[]>([]);
  private _page = signal(1);
  private _pageSize = signal(10);
  private _total = signal(0);
  private _totalPages = signal(0);
  private _query = signal('');
  private _roleFilter = signal<'USER' | 'ADMIN' | ''>('');
  private _listStatus = signal<LoadingStatus>('idle');
  private _listError = signal<string | null>(null);
  private _mutateStatus = signal<LoadingStatus>('idle');
  private _mutateError = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly total = this._total.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly query = this._query.asReadonly();
  readonly roleFilter = this._roleFilter.asReadonly();
  readonly listStatus = this._listStatus.asReadonly();
  readonly listError = this._listError.asReadonly();
  readonly mutateStatus = this._mutateStatus.asReadonly();
  readonly mutateError = this._mutateError.asReadonly();

  listUsers(opts: { page?: number; pageSize?: number; q?: string; role?: 'USER' | 'ADMIN' | '' } = {}) {
    this._listStatus.set('loading');
    this._listError.set(null);

    const params = {
      page: opts.page ?? this._page(),
      pageSize: opts.pageSize ?? this._pageSize(),
      q: (opts.q ?? this._query()) || undefined,
      role: (opts.role ?? this._roleFilter()) || undefined
    };

    return this.api.get<PaginatedResponse<UserWithCount>>('/users', params).pipe(
      tap((response) => {
        this._items.set(response.items);
        this._page.set(response.page);
        this._pageSize.set(response.pageSize);
        this._total.set(response.total);
        this._totalPages.set(response.totalPages);
        this._listStatus.set('success');
      }),
      catchError((err) => {
        this._listStatus.set('error');
        this._listError.set(err?.error?.message || 'Failed to fetch users');
        throw err;
      })
    );
  }

  updateRole(id: number, role: 'USER' | 'ADMIN') {
    this._mutateStatus.set('loading');
    this._mutateError.set(null);

    return this.api.patch<User>(`/users/${id}/role`, { role }).pipe(
      tap(() => {
        this._mutateStatus.set('success');
      }),
      catchError((err) => {
        this._mutateStatus.set('error');
        this._mutateError.set(err?.error?.message || 'Failed to update role');
        throw err;
      })
    );
  }

  setQuery(q: string): void {
    this._query.set(q);
  }

  setRoleFilter(role: 'USER' | 'ADMIN' | ''): void {
    this._roleFilter.set(role);
  }
}
